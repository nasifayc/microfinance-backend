import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { Permissions } from 'src/auth/decorator';
import { CreateStaffDto, UpdateStaffDto } from './dto';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Permissions('staff.create')
  @Post()
  create(@Body() dto: CreateStaffDto) {
    return this.staffService.create(dto);
  }

  @Permissions('staff.read')
  @Get()
  findAll() {
    return this.staffService.findAll();
  }

  @Permissions('staff.read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @Permissions('staff.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStaffDto) {
    return this.staffService.update(id, dto);
  }

  @Permissions('staff.delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }
}
