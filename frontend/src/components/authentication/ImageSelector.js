import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// 导入画作完整信息
import paintingsData from '../../assets/data/paintings_complete_info.json';

const ImageSelector = ({ open, onClose, onSelect }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [availableImages, setAvailableImages] = useState([]);

  // 加载画作数据
  useEffect(() => {
    // 从 JSON 中提取图片信息，使用"作品名"和"图像url"
    const images = paintingsData.map(painting => ({
      id: painting.编号,
      name: painting.作品名,
      path: `../../assets/data/${painting.图像url}`,
      author: painting.作者名,
      period: painting.创作时间
    }));
    setAvailableImages(images);
  }, []);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleConfirm = () => {
    if (selectedImage && onSelect) {
      onSelect(selectedImage);
    }
    onClose();
  };

  const handleCancel = () => {
    setSelectedImage(null);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle style={{ 
        backgroundColor: '#FBF5F0', 
        fontWeight: 'bold',
        borderBottom: '2px solid #D19762'
      }}>
        选择画作
      </DialogTitle>
      
      <DialogContent style={{ padding: '20px', backgroundColor: '#FEFEFE' }}>
        <Grid container spacing={2} style={{ marginTop: '10px' }}>
          {availableImages.map((image) => (
            <Grid item xs={6} sm={4} md={3} key={image.id}>
              <Card 
                style={{ 
                  position: 'relative',
                  border: selectedImage?.id === image.id ? '3px solid #D19762' : '1px solid #ddd',
                  boxShadow: selectedImage?.id === image.id ? '0 4px 12px rgba(209, 151, 98, 0.4)' : 'none',
                  transition: 'all 0.3s',
                  height: '100%'
                }}
              >
                <CardActionArea onClick={() => handleImageClick(image)}>
                  {/* 固定比例容器 */}
                  <div style={{
                    width: '100%',
                    height: '180px',
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <CardMedia
                      component="img"
                      image={image.path}
                      alt={image.name}
                      style={{ 
                        maxWidth: '100%',
                        maxHeight: '100%',
                        width: 'auto',
                        height: 'auto',
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  {selectedImage?.id === image.id && (
                    <div style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      backgroundColor: '#D19762',
                      borderRadius: '50%',
                      padding: '2px'
                    }}>
                      <CheckCircleIcon style={{ color: 'white', fontSize: '24px' }} />
                    </div>
                  )}
                </CardActionArea>
                <div style={{ 
                  padding: '8px', 
                  textAlign: 'center', 
                  fontSize: '12px',
                  fontWeight: selectedImage?.id === image.id ? 'bold' : 'normal',
                  color: selectedImage?.id === image.id ? '#D19762' : '#666'
                }}>
                  {image.name}
                </div>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      
      <DialogActions style={{ padding: '16px', backgroundColor: '#FBF5F0' }}>
        <Button 
          onClick={handleCancel}
          style={{ color: '#666' }}
        >
          取消
        </Button>
        <Button 
          onClick={handleConfirm}
          disabled={!selectedImage}
          variant="contained"
          style={{ 
            backgroundColor: selectedImage ? '#D19762' : '#ccc',
            color: 'white'
          }}
        >
          确认选择
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageSelector;
