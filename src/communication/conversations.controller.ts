import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';   // adjust
import { ChatGateway } from './chat.gateway';
import { ConversationsService } from './conversations.service';
import { ContactProviderDto } from './dto/contact-provider.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller()                    // the CLI generated 'conversations'. Use empty, because our routes differ
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private service: ConversationsService, private gateway: ChatGateway) {}

  @Post('providers/:id/contact')
  async contact(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ContactProviderDto) {
    const { message, participantIds } = await this.service.contactProvider(req.user.id, id, dto.message);
    this.gateway.pushMessage(message, participantIds);
    return message;
  }

  @Get('conversations')
  list(@Req() req: any) { return this.service.list(req.user.id); }

  @Get('conversations/:id')
  getOne(@Req() req: any, @Param('id', ParseUUIDPipe) id: string,
         @Query('before') before?: string,
         @Query('limit', new DefaultValuePipe(30), ParseIntPipe) limit?: number) {
    return this.service.getOne(id, req.user.id, before, limit);
  }

  @Post('conversations/:id/messages')
  async send(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: SendMessageDto) {
    const { message, participantIds } = await this.service.sendMessage(id, req.user.id, dto.body);
    this.gateway.pushMessage(message, participantIds);
    return message;
  }
}