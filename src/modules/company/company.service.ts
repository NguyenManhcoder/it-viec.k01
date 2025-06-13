import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { User } from 'src/databases/entities/user.entity';
import { StorageService } from '../storage/storage.service';
import { error } from 'console';
@Injectable()
export class CompanyService {

  constructor( 
    private readonly companyRepository : CompanyRepository, 
    private readonly storageService: StorageService 
  ){}


  async update(id:number, body : UpdateCompanyDto, user: User){

    // Validate chi co hr trong company moi update duoc company do
    const companyRec = await this.companyRepository.findOneBy({id, userId: user.id})
    // check company ton tai
      if(!companyRec){
        throw new HttpException('Company not found ', HttpStatus.NOT_FOUND)
      }

    // Validate path logo
      if( body.logo){
        
        console.log("body.logo : ",body.logo)
        await this.storageService.getSignedUrl(body.logo)
      }
      

    const companyUpdated = await this.companyRepository.save({
      ...companyRec,
      ...body,
    });

    if(companyUpdated.logo){
      companyUpdated.logo = await this.storageService.getSignedUrl(
        companyUpdated.logo
      );
    }

    // Validate industry

    const industryRec = await this.companyRepository.findOneBy({ id : body.industryId })

    if(!industryRec){
      throw new error('Industry not found with id = '+ body.industryId,
        HttpStatus.NOT_FOUND,
      )
    }

    // delete ảnh cũ nếu thay đổi logo còn nếu vẫn thế thì không thay đổi
    if(companyRec.logo != body.logo){
      await this.companyRepository.delete(companyRec.logo);
    }
    
    return {
        message: 'Update company successfully',
        result:companyUpdated
      }
  }

  
}
