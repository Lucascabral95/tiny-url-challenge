import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OpsStatusResponseDto } from '../dto/ops-status-response.dto';
import { OpsService } from '../services/ops.service';

@ApiTags('ops')
@Controller('ops')
export class OpsController {
  constructor(private readonly opsService: OpsService) {}

  @ApiOperation({
    summary: 'Consultar estado operativo de cola, outbox y cache',
  })
  @ApiOkResponse({
    description: 'Estado operativo minimo para diagnosticar fallos.',
    type: OpsStatusResponseDto,
  })
  @Get('status')
  getStatus(): Promise<OpsStatusResponseDto> {
    return this.opsService.getStatus();
  }
}
