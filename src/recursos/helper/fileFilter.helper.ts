
export const fileFilter=(req:Express.Request,file:Express.Multer.File,callback:Function)=>{
    if(!file) return callback(new Error("El archivo es necesario"),false)
    const field=file.fieldname
    let validMimeTypes
    if(field==='url_imagen'){
        validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    }

    if(field==='doc_url'){
        validMimeTypes=['application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    }

    
  if (validMimeTypes.includes(file.mimetype)) {
    return callback(null, true);
  }
  return callback(new Error('Tipo de archivo no permitido'), false);
}