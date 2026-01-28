

# 🌍 Demo 3D Globe - Vietnam Global Connections

## Tổng quan
Tạo một trang demo với quả địa cầu 3D tương tác sử dụng Three.js (thông qua @react-three/fiber), thể hiện Việt Nam là điểm sáng trung tâm với các đường kết nối đến các quốc gia trên thế giới.

---

## Tính năng chính

### 1. **Quả địa cầu 3D với lục địa chính xác**
- Sử dụng texture bản đồ thế giới để tạo các chấm (dots) theo đúng hình dạng các châu lục
- Màu chấm: Cyan/Teal (#00FFFF) tạo hiệu ứng tech
- Khoảng 5000+ điểm phân bố theo lục địa thực

### 2. **Điểm sáng Việt Nam nổi bật**
- Marker lớn, sáng rực tại vị trí Việt Nam (14.05°N, 108.27°E)
- Hiệu ứng glow phát sáng trắng/cyan

### 3. **Đường kết nối toàn cầu**
- 15-20 đường cong Bezier từ Việt Nam đến các thành phố lớn trên thế giới
- Màu tím/magenta (#A020F0) với hiệu ứng trong suốt
- Các đường cong lên cao hơn bề mặt cầu tạo cảm giác 3D

### 4. **Tương tác người dùng**
- Tự động xoay nhẹ khi không tương tác
- Kéo thả để xoay globe theo ý muốn (OrbitControls)
- Zoom in/out bằng scroll

### 5. **Giao diện tổng thể**
- Nền tối (#050510) phong cách tech/sci-fi
- Globe chiếm toàn màn hình (fullscreen)
- Responsive trên mọi kích thước màn hình

---

## Công nghệ sử dụng
- **@react-three/fiber** & **@react-three/drei** cho React + Three.js
- **three.js** cho đồ họa 3D
- Tailwind CSS cho styling container

