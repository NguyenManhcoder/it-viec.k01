
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from './mail.service';

@Processor('mail-queue')
export class MailProcessor extends WorkerHost {
    constructor(private readonly mailService : MailService){
        super()
    }
  async process(job: Job<any, any, string>): Promise<any> {
    console.log(job);
    if(job.name === 'send-mail-applicant'){
        await this.mailService.sendMail(
            job.data.email,
            'Welcome to ITViec', 
            'welcome-applicant',
            {
                name:job.data.username,
                email:job.data.email,
            },
        );

        console.log('Job send mail to company đã được xử lí thành công', job.data);
    }

    if(job.name === 'send-mail-company'){
        await this.mailService.sendMail(
            job.data.email,
            'Welcome to company ITViec', 
            'welcome-applicant',
            {
                name:job.data.username,
                email:job.data.email,
                company: job.data.companyName,
            },
        );
    }
  }
}
