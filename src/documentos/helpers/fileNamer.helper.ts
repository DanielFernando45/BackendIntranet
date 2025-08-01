import {v4 as uuid} from 'uuid'

export const fileNamer=(req:Express.Request,file:Express.Multer.File,callback:Function)=>{
    if(!file) return callback(new Error('File is empty'),false)

    // const fileNames=files.map((file)=>{
    //     const fileExtension=file.mimetype.split('/')[1]
    //     return `${uuid()}.${fileExtension}`
    // })
    const fileExtension=file.mimetype.split('/')[1]

    const fileName=`${uuid()}.${fileExtension}`

    console.log(fileName)

    callback(null,fileName)
}