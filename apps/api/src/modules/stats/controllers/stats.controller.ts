import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../common/dto/error-response.dto';
import { StatsResponseDto } from '../dto/stats-response.dto';
import { StatsResponse, StatsService } from '../services/stats.service';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @ApiOperation({ summary: 'Consultar estadisticas de una Tiny URL' })
  @ApiParam({
    name: 'code',
    example: 'mi-alias',
    description: 'Codigo corto o alias de la Tiny URL.',
  })
  @ApiOkResponse({
    description: 'Estadisticas encontradas.',
    type: StatsResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'No existen estadisticas para el codigo enviado.',
    type: ErrorResponseDto,
  })
  @Get(':code')
  getStats(@Param('code') code: string): Promise<StatsResponse> {
    return this.statsService.getStats(code);
  }
}
