import { BadRequestException } from "@nestjs/common"

export const fileFilter=(req:Express.Request,file:Express.Multer.File,callback:Function)=>{
    if(!file) return callback(new Error('File is empty'),false)
    
    // for(const file of files){
    //     const fileExtension=file.mimetype.split('/')[1]
    //     console.log(fileExtension)
    //     const validExtension=['vnd.openxmlformats-officedocument.wordprocessingml.document','pdf','vnd.openxmlformats-officedocument.spreadsheetml.sheet','vnd.ms-excel']

    //     if(!validExtension.includes(fileExtension)) return callback(new BadRequestException(`Tipo de documento invalido:${fileExtension}`),false)
    // }

    const fileExtension=file.mimetype.split('/')[1]
    console.log(file.mimetype)
    const validExtension=['application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // Videos
    //'video/mp4', 'video/webm', 'video/ogg',
    // Imágenes
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    // Comprimidos
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed']

    if(validExtension.includes(fileExtension)){
        return callback(null,true)
    }
    
    callback(null,true)
}   