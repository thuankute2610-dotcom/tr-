// Tìm vùng chứa (container) trên giao diện HTML nơi sẽ đổ danh sách sản phẩm vào
const container = document.getElementById("cacLoaiHoa");

// Hàm định dạng số thành tiền tệ Việt Nam (ví dụ: 1000000 -> 1.000.000 ₫)
function formatVND(tien) { 
    return Number(tien).toLocaleString("vi-VN", { style: "currency", currency: "VND" }); 
}
// Chỉnh sửa trong hàm render sản phẩm (ví dụ renderDetail)
function renderProductDetail(item) {
    return `
        <div class="product-detail">
            <img src="${item.image}" alt="${item.name}">
            <h2>${item.name}</h2>
            <p class="price">${item.price.toLocaleString()} VNĐ</p>
            
            <div class="action-buttons">
                <button class="btn-add-cart" onclick="addToCart(${item.id})">
                    🛒 Thêm vào giỏ
                </button>
                
                <button class="btn-buy-now" onclick="buyNow(${item.id})">
                    💳 Thanh toán ngay
                </button>
            </div>
        </div>
    `;
}
// Hàm chính để hiển thị danh sách điện thoại lên màn hình
function hienThiHoa() {
    // Truy xuất lại vùng chứa để đảm bảo phần tử này tồn tại trên trang hiện tại
    const container = document.getElementById("cacLoaiHoa");
    // Nếu không tìm thấy vùng chứa (ví dụ đang ở trang không có danh sách máy), thoát hàm ngay
    if (!container) return;
    // Xóa sạch các nội dung cũ bên trong vùng chứa trước khi nạp dữ liệu mới
    container.innerHTML = "";

    // Lấy các tham số trên thanh địa chỉ URL (ví dụ: ?brand=Samsung)
    const params = new URLSearchParams(window.location.search);
    // Trích xuất giá trị của tham số có tên là 'brand' (hãng máy)
    const danhmuc = params.get('brand');

    // Mặc định ban đầu, dữ liệu hiển thị sẽ là toàn bộ danh sách từ file data.js
    let duLieu = danhSachHoa;

    // Kiểm tra nếu người dùng có bấm vào lọc theo hãng (ví dụ bấm vào mục iPhone)
  
    if (danhmuc) {
        // Lọc lại dữ liệu chỉ giữ lại những máy có thuộc hãng đúng như tham số trên URL
        duLieu = danhSachHoa.filter(item => item.category.toLowerCase() === danhmuc.toLowerCase());
    }

    // Sau khi có danh sách (đã lọc hoặc tất cả), dùng vòng lặp để tạo giao diện cho từng máy
    duLieu.forEach(item => {
        // Tạo một thẻ <div> mới để làm khung card cho mỗi sản phẩm
        const card = document.createElement("div");
        // Gán class CSS 'flower-card' để máy có khung viền và đổ bóng đẹp mắt
        card.className = "flower-card";
        
        // Nạp nội dung HTML vào trong thẻ div vừa tạo bằng Template String (dấu `)
        card.innerHTML = `
            <img src="${item.img}" onclick="window.location.href='detail.html?id=${item.id}'">
            <h3>${item.name}</h3>
            <p>${formatVND(item.price)}</p>
            <button onclick="themVaoGio(${item.id})">MUA NGAY</button>
        `;
        // Cuối cùng, bỏ thẻ div sản phẩm vừa tạo vào trong vùng chứa chính trên trang web
        container.appendChild(card);
    });
}

