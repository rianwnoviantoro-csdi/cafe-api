import { v2 } from 'cloudinary'
import sharp from 'sharp'

export const uploadStream = (fileBuffer, folderName, widthSize) => {
  return new Promise((resolve, reject) => {
    v2.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_KEY,
      api_secret: process.env.CLOUD_SECRET
    })

    const uploadStream = v2.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
        width: widthSize,
        crop: 'scale'
      },
      (error, result) => {
        result ? resolve(result) : reject(error)
      }
    )
    sharp(fileBuffer).webp().pipe(uploadStream)
  })
}
