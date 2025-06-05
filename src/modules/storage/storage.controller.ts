import { Public } from "src/commons/decorators/public.decorator";
import { StorageService } from "./storage.service";
import {  BadRequestException, Body, Controller, Delete, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes } from "@nestjs/swagger";
import { UploadedFileDto } from "./dto/upload-file.dto";
import path from "path";

@Controller('storage')
export class StorageController {
    constructor (private readonly storageService : StorageService){}


  //Upload images
  @Public()
  @Post('upload/image')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file')) 
  @ApiBody({
    type : UploadedFileDto,
  })
  async uploadImage( @UploadedFile() file: Express.Multer.File ){

    // Validate file type
    const validMineTypes = ['image/jpeg','image/png','image/gif']
    if(!validMineTypes.includes(file.mimetype)){ // những thành phần khong nằm trong mine type thì sẽ báo lỗi
      throw new BadRequestException(
        'Invalid file type.Only images are allow',
      );
    }

    //Validate size(<5MB)
    const maxSizeBytes = 5 * 1024 * 1024;
    if(file.size > maxSizeBytes) {
      throw new BadRequestException('File size exceedss the 5MB')
    }

    const filePath = `/images/${Date.now()}/${file.originalname}`;
    const uploadResult = await this.storageService.uploadFile(
      filePath,
      file.buffer,
    )


    const publicUrl = await this.storageService.getSignedUrl(uploadResult.path)
      return {
        message:'Image upload successfully',
        result:{
          publicUrl,
          path:uploadResult.path,
        }
      }
  }

  // Upload pdf
  @Public()
  @Post('upload/cv')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file')) 
  @ApiBody({
    type : UploadedFileDto,
  })
  async uploadCV( @UploadedFile() file: Express.Multer.File ){

    // Validate file type
    const [, fileType] = file.originalname.split('.');

    console.log(fileType)

    // return {
    //   message:'CV upload successfully',
    // };

    const validMineTypes = ['pdf','doc','docx']
    if(!validMineTypes.includes(fileType)){ // những thành phần khong nằm trong mine type thì sẽ báo lỗi
      throw new BadRequestException(
        'Invalid file type.Only images are allow',
      );
    }

    //Validate size(<3MB)
    const maxSizeBytes = 3 * 1024 * 1024;
    if(file.size > maxSizeBytes) {
      throw new BadRequestException('File size exceedss the 5MB')
    }

    const filePath = `/cvs/${Date.now()}/${file.originalname}`;
    const uploadResult = await this.storageService.uploadFile(
      filePath,
      file.buffer,
    )


    const publicUrl = await this.storageService.getSignedUrl(uploadResult.path)
      return {
        message:'CV upload successfully',
        result:{
          publicUrl,
          path:uploadResult.path,
        },
      };
  }

  @Public()
  @Delete('delete')
  async deleteFile(@Body() body: { key: string}){
    const result = this.storageService.delete(body.key);

    console.log(result);
    return {
      message:'Delete file succesfully'
    }
  }
}
