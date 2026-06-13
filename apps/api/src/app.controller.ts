import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthResponseDto } from './app.dto';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Consultar estado basico de la API' })
  @ApiOkResponse({
    description: 'La API esta disponible.',
    type: HealthResponseDto,
  })
  @Get('health')
  getHealth(): HealthResponseDto {
    return this.appService.getHealth();
  }
}
