import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from './common/dto/error-response.dto';
import { HealthResponseDto, ReadinessResponseDto } from './app.dto';
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

  @ApiOperation({
    summary: 'Consultar si la API esta lista para recibir trafico',
  })
  @ApiOkResponse({
    description: 'La API esta lista y MongoDB responde correctamente.',
    type: ReadinessResponseDto,
  })
  @ApiServiceUnavailableResponse({
    description: 'La API no esta lista porque una dependencia critica fallo.',
    type: ErrorResponseDto,
  })
  @Get('ready')
  getReadiness(): Promise<ReadinessResponseDto> {
    return this.appService.getReadiness();
  }
}
