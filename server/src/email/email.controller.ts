import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmailService } from './email.service';
import { CreateEmailDto } from './dto/create-emails.dto';
import { UpdateEmailDto } from './dto/update-emails.dto';

@Controller('email')
export class EmailController {
    constructor(private readonly emailService: EmailService) {}

    @Post()
    create(@Body() createEmailDto: CreateEmailDto) {
        // Implementation for creating an email
        return this.emailService.create(createEmailDto);
    }

    @Get()
    fetchAll(){
        // fetch all emails
        return this.emailService.findAll();
    }

    @Get(':id')
    fetchMultiple(@Param('id') id: string){
        // fetch emails for a specific user
        return this.emailService.findMultiple(id);
    }

    @Get('single/:id')
    fetchOne(@Param('id') id: string){
        // fetch a single email by ID
        return this.emailService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateEmailDto: UpdateEmailDto) {
        // update an email by ID
        return this.emailService.update(id, updateEmailDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        // delete an email by ID
        return this.emailService.remove(id);
    }
}
