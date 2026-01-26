// Bước 1: Lấy ID của sản phẩm từ thanh địa chỉ URL (Ví dụ: detail.html?id=1)
const urlParams = new URLSearchParams(window.location.search);
// Chuyển ID từ dạng chữ sang dạng số nguyên
const productId = parseInt(urlParams.get('id'));
// Tìm kiếm sản phẩm trong danh sách (data.js) có ID trùng với ID vừa lấy được
const product = danhSachHoa.find(p => p.id === productId);

// Hàm định dạng số thành tiền Việt Nam (Ví dụ: 30000000 -> 30.000.000 ₫)
function formatVND(t) { 
    return Number(t).toLocaleString("vi-VN", { style: "currency", currency: "VND" }); 
}

// Nếu tìm thấy sản phẩm hợp lệ trong danh sách
if (product) {
    // Tìm thẻ HTML có ID là "product-detail" để chuẩn bị đổ dữ liệu vào
    const detailContainer = document.getElementById("product-detail");
    
    // Sử dụng Template String (dấu `) để tạo cấu trúc HTML hiển thị chi tiết
    detailContainer.innerHTML = `
        <div class="detail-image">
            <img src="${product.img}" alt="${product.name}">
        </div>
        <div class="detail-info">
            <h1>${product.name}</h1>
            <h2 class="detail-price">${formatVND(product.price)}</h2>
            
            <div class="quantity-section">
                <label>Số lượng:</label>
                <input type="number" id="sl-${product.id}" value="1" min="1" class="input-quantity">
            </div>

            <div class="total-section">
                <span>Thành tiền:</span>
                <span id="total-price" class="total-amount">${formatVND(product.price)}</span>
            </div>

            <button class="btn-add" onclick="themVaoGio(${product.id})">THÊM VÀO GIỎ HÀNG</button>
        </div>
    `;

    // --- LOGIC CẬP NHẬT GIÁ TỨC THÌ ---
    // Lấy phần tử ô nhập số lượng và phần tử hiển thị tổng tiền vừa tạo ở trên
    const inputSl = document.getElementById(`sl-${product.id}`);
    const totalPriceDisplay = document.getElementById("total-price");

    // Lắng nghe mỗi khi người dùng thay đổi số lượng (gõ phím hoặc bấm mũi tên)
    inputSl.addEventListener("input", function() {
        let sl = parseInt(this.value);
        // Nếu người dùng xóa hết số hoặc nhập số nhỏ hơn 1, mặc định quay về 1
        if (isNaN(sl) || sl < 1) sl = 1;
        
        // Tính toán Thành tiền mới
        const thanhTien = sl * product.price;
        // Cập nhật lại chuỗi hiển thị tiền tệ lên giao diện ngay lập tức
        totalPriceDisplay.innerText = formatVND(thanhTien);
    });
}
// Hàm kiểm tra và hiển thị trạng thái đăng nhập trên trang chi tiết
function kiemTraDangNhapChiTiet() {
    // Lấy dữ liệu người dùng từ LocalStorage (đã được lưu từ trang chủ)
    const nguoiDungHienTai = JSON.parse(localStorage.getItem("currentUser"));
    const authButtons = document.getElementById('auth-buttons');

    if (nguoiDungHienTai && authButtons) {
        // Nếu đã đăng nhập: Thay đổi giao diện nút Đăng nhập/Đăng ký
        authButtons.innerHTML = `
            <div class="user-logged-in">
                <span class="user-name">Chào, ${nguoiDungHienTai.name}</span>
                <button class="btn-auth logout" onclick="handleLogout()">Thoát</button>
                <a href="cart.html" class="btn-nav btn-cart">
                    🛒 Giỏ hàng <span id="cart-count">0</span>
                </a>
            </div>
        `;
    }
    // Luôn cập nhật số lượng giỏ hàng nếu có hàm này
    if (typeof capNhatBadgeGioHang === "function") {
        capNhatBadgeGioHang();
    }
}

// Hàm đăng xuất dùng chung cho các trang
function handleLogout() {
    localStorage.removeItem("currentUser");
    // Sau khi đăng xuất, tải lại trang để quay về trạng thái ban đầu
    window.location.reload();
}

// Chạy hàm kiểm tra ngay khi trang chi tiết vừa nạp xong
document.addEventListener("DOMContentLoaded", kiemTraDangNhapChiTiet);