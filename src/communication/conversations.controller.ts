import { Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, ParseUUIDPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';   // adjust
import { ChatGateway } from './chat.gateway';
import { ConversationsService } from './conversations.service';
import { ContactProviderDto } from './dto/contact-provider.dto';
import { SendMessageDto } from './dto/send-message.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller()                    // the CLI generated 'conversations'. Use empty, because our routes differ
@UseGuards(JwtAuthGuard)
@ApiTags('conversations')
@ApiBearerAuth()
export class ConversationsController {
  constructor(private service: ConversationsService, private gateway: ChatGateway) {}

  @Post('providers/:id/contact')
  @ApiOperation({ summary: 'Contact a provider and start a conversation' })
  @ApiParam({ name: 'id', description: 'UUID of the provider' })
  @ApiResponse({ status: 201, description: 'Message sent to provider' })
  async contact(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ContactProviderDto) {
    const { message, participantIds } = await this.service.contactProvider(req.user.id, id, dto.message);
    this.gateway.pushMessage(message, participantIds);
    return message;
  }

  @Get('conversations')
  @ApiOperation({ summary: 'List the current user conversations' })
  @ApiResponse({ status: 200, description: 'Conversations returned' })
  list(@Req() req: any) { return this.service.list(req.user.id); }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get a conversation and its messages' })
  @ApiParam({ name: 'id', description: 'UUID of the conversation' })
  @ApiQuery({ name: 'before', required: false, description: 'Return messages before this cursor' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Maximum number of messages (default 30)' })
  @ApiResponse({ status: 200, description: 'Conversation returned' })
  getOne(@Req() req: any, @Param('id', ParseUUIDPipe) id: string,
         @Query('before') before?: string,
         @Query('limit', new DefaultValuePipe(30), ParseIntPipe) limit?: number) {
    return this.service.getOne(id, req.user.id, before, limit);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a message in a conversation' })
  @ApiParam({ name: 'id', description: 'UUID of the conversation' })
  @ApiResponse({ status: 201, description: 'Message sent' })
  async send(@Req() req: any, @Param('id', ParseUUIDPipe) id: string, @Body() dto: SendMessageDto) {
    const { message, participantIds } = await this.service.sendMessage(id, req.user.id, dto.body);
    this.gateway.pushMessage(message, participantIds);
    return message;
  }
}