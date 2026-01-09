'use strict';

const uniID = require('uni-id-common')

exports.main = async (event, context) => {
  // 获取客户端传递的文件信息
  const { fileName, fileBase64 } = event;
  
  // 验证参数
  if (!fileName || !fileBase64) {
    return {
      code: -1,
      msg: '缺少必要参数'
    };
  }
  
  try {
    // 将base64转换为Buffer
    const buffer = Buffer.from(fileBase64, 'base64');
    
    // 构造云存储路径（使用时间戳确保唯一性）
    const timestamp = new Date().getTime();
    const ext = fileName.substring(fileName.lastIndexOf('.'));
    const cloudPath = `avatars/${timestamp}_${Math.floor(Math.random() * 1000)}${ext}`;
    
    // 上传到uniCloud云存储
    const uploadResult = await uniCloud.uploadFile({
      cloudPath: cloudPath,
      fileContent: buffer
    });
    
    // 返回文件访问地址
    if (uploadResult.fileID) {
      // 获取文件访问URL
      const urlResult = await uniCloud.getTempFileURL({
        fileList: [uploadResult.fileID]
      });
      
      if (urlResult.fileList && urlResult.fileList.length > 0) {
        return {
          code: 0,
          msg: '上传成功',
          data: {
            url: urlResult.fileList[0].tempFileURL,
            fileID: uploadResult.fileID
          }
        };
      }
    }
    
    return {
      code: -1,
      msg: '上传失败'
    };
  } catch (err) {
    console.error('文件上传错误:', err);
    return {
      code: -1,
      msg: '上传失败：' + err.message
    };
  }
};