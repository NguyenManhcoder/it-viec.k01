import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileOptions } from '@supabase/storage-js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageError, FileObject } from '@supabase/storage-js'; 

@Injectable()
export class StorageService {
  private client : SupabaseClient;
  private bucket: string;

  constructor( 
    private readonly configService:ConfigService,
  ){
    this.client = createClient(
      this.configService.get('supabase').url,
      this.configService.get('supabase').key,
    );
    this.bucket = this.configService.get('supabase').bucket
  }

  async uploadFile( key: string, file:Buffer,options:FileOptions = {}){
    const { data, error } = await this.client.storage
    .from(this.bucket)
    .upload(key, file,{
      ...options
    }); 

    if(error){
        throw new Error('uploadFile failed: ' + error.message)
      }


    return {
      path: data.path,
    };
  }

  async getSignedUrl(key: string, expiresIn = 600){
    const { data, error} = await this.client.storage
    .from('it-viec')
    .createSignedUrl(key, expiresIn);

    if(error) {
      throw new Error('getSignedUrl failed : '+ error.message)
    }
    return data.signedUrl;
  }

  async delete(key: string): Promise<FileObject[]> {
  const { data, error } = await this.client.storage
    .from(this.bucket)
    .remove([key]);

  if (error) {
    throw new Error('Delete file failed ' + error.message);
  }

  return data;
}

  

}
