import { Controller ,Post,Body,Get, Param, Patch, ParseIntPipe, Delete, UseGuards, BadRequestException, Req} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CrearlienteDto } from './dto/crear-admin.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ChangePasswordDto } from 'src/auth/dto/changue-password.dto';


@Controller('admin')
export class AdminController {
    constructor(private readonly adminService:AdminService){}

    @Get(':id')
    async listOne(@Param('id') id:string){
        const ID:number=parseInt(id)
        return this.adminService.listOneAdmin(ID)
    }

    @Get()
    async listAll(){
        return this.adminService.listAdmin();
    }

    @Post('/add')
    async create(@Body() body:CrearlienteDto){
        return this.adminService.create(body)
    }

    @Patch('/update/:id')
    async patchAdmin(@Body() body:CrearlienteDto,@Param('id',ParseIntPipe) id:number){
        return this.adminService.patchAdmin(body,id)
    }

    @Delete('/delete/:id')
    async byeAdmin(@Param('id',ParseIntPipe) id:number){
        try {
            return this.adminService.deleteAdmin(id);
          } catch (err) {
            console.error(err);
            throw err;
          }
    }
    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles('admin')
    @Patch('desactivate/:id')
    async desactivate(@Param('id',ParseIntPipe) id:number){
        return this.adminService.desactivateAdmin(id)
    }

    @UseGuards(JwtAuthGuard)
    @Patch('change-password')
    async change(@Body() contraseñas:ChangePasswordDto ,@Req() req:Request){
    const {oldPassword,newPassword,repeatPassword}=contraseñas
    console.log()
    if(oldPassword || newPassword || repeatPassword){
      return new BadRequestException("No estan todos los campos necesarios")
    }
    return this.adminService.changePassword(oldPassword,newPassword,repeatPassword)

  }

}
