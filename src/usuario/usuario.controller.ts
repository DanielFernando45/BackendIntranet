import { Controller, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { UsuarioService } from './usuario.service';

@Controller('/usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  // @Patch("desactivate/:id")
  // async desactivate(@Param('id',ParseIntPipe) id:number){
  //     return this.usuarioService
  // }
}
