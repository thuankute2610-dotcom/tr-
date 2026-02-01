// Lấy dữ liệu giỏ hàng từ LocalStorage (bộ nhớ trình duyệt), nếu chưa có gì thì khởi tạo mảng rỗng []
let gioHang = JSON.parse(localStorage.getItem("gioHang")) || [];

// Hàm giúp định dạng con số thành tiền Việt Nam (VND) để hiển thị chuyên nghiệp hơn
function formatVND(t) { return Number(t).toLocaleString("vi-VN", { style:"currency", currency:"VND" }); }

// Hàm lưu trạng thái giỏ hàng hiện tại vào LocalStorage để khi load lại trang không bị mất đồ đã chọn
function luuGioHang() { localStorage.setItem("gioHang", JSON.stringify(gioHang)); }

// Hàm xử lý khi người dùng nhấn nút "THÊM VÀO GIỎ"
function themVaoGio(id) {
    // Tìm ô nhập số lượng của sản phẩm đó (nếu có)
    const slInput = document.getElementById(`sl-${id}`);
    // Nếu có ô nhập thì lấy giá trị đó, nếu không thì mặc định là 1
    const sl = slInput ? Number(slInput.value) : 1;
    // Kiểm tra xem sản phẩm này đã nằm trong giỏ hàng chưa
    const item = gioHang.find(i => i.id === id);
    
    if (item) {
        // Nếu có rồi thì chỉ cần cộng thêm số lượng mới vào
        item.soLuong += sl;
    } else {
        // Nếu chưa có, tìm thông tin gốc của sản phẩm từ data.js và đẩy vào mảng giỏ hàng kèm số lượng
        const p = danhSachHoa.find(x => x.id === id);
        gioHang.push({ ...p, soLuong: sl });
    }
    
    luuGioHang(); // Lưu lại thay đổi vào bộ nhớ máy
    capNhatBadgeGioHang(); // Cập nhật con số hiển thị trên icon giỏ hàng ngay lập tức
    alert("Đã thêm vào giỏ hàng!"); // Thông báo cho khách hàng biết
}

// Biến lưu trữ mã giảm giá đã áp dụng
let appliedDiscount = 0;

// Hàm vẽ giao diện danh sách các món đồ đã chọn vào trang cart.html
function hienThiGioHang() {
    const body = document.getElementById("gioHangBody"); // Tìm bảng chứa giỏ hàng
    if(!body) return; // Nếu không thấy bảng (đang ở trang khác) thì dừng
    body.innerHTML = ""; // Xóa nội dung cũ để vẽ lại từ đầu
    let tong = 0; // Biến dùng để tính tổng số tiền của cả giỏ hàng

    gioHang.forEach(item => {
        let thanhTien = item.price * item.soLuong; // Tính tiền cho từng món (giá x số lượng)
        tong += thanhTien; // Cộng dồn vào tổng tiền cuối cùng
        // Chèn một dòng mới vào bảng HTML bằng Template String
        body.innerHTML += `
            <tr>
                <td><img src="${item.img}" width="50"> ${item.name}</td>
                <td>${formatVND(item.price)}</td>
                <td><input type="number" class="input-quantity" value="${item.soLuong}" min="1" onchange="doiSL(${item.id}, this.value)"></td>
                <td>${formatVND(thanhTien)}</td>
                <td><button onclick="xoaItem(${item.id})">❌</button></td>
            </tr>`;
    });
    // Hiển thị tổng số tiền cuối cùng xuống dưới bảng
    document.getElementById("tongTien").innerText = "Tổng tiền: " + formatVND(tong);

    // Cập nhật tổng thanh toán sau giảm giá
    updateFinalTotal(tong);
}

// Hàm xử lý khi người dùng thay đổi số lượng trong bảng giỏ hàng
function doiSL(id, sl) {
    const item = gioHang.find(i => i.id === id);
    if(item) item.soLuong = Number(sl); // Cập nhật số lượng mới cho sản phẩm
    luuGioHang(); // Lưu lại
    hienThiGioHang(); // Vẽ lại giao diện để cập nhật "Thành tiền" và "Tổng tiền"
}

// Hàm xóa hoàn toàn một sản phẩm ra khỏi giỏ hàng
function xoaItem(id) {
    // Lọc lấy tất cả sản phẩm TRỪ sản phẩm có ID muốn xóa
    gioHang = gioHang.filter(i => i.id !== id);
    luuGioHang(); // Lưu lại
    hienThiGioHang(); // Vẽ lại giao diện
    capNhatBadgeGioHang(); // Cập nhật lại con số trên icon giỏ hàng
}
// Hàm xóa toàn bộ giỏ hàng
function clearFullCart() {
    // 1. Xác nhận với người dùng trước khi xóa
    const confirmDelete = confirm("Bạn có chắc chắn muốn xóa toàn bộ sản phẩm trong giỏ hàng không?");

    if (confirmDelete) {
        // 2. Xóa dữ liệu giỏ hàng trong localStorage
        localStorage.removeItem('gioHang');

        // 3. Cập nhật lại biến giỏ hàng toàn cục
        gioHang = [];

        // 4. Cập nhật lại số lượng hiển thị trên icon giỏ hàng
        capNhatBadgeGioHang();

        // 5. Vẽ lại giao diện giỏ hàng (sẽ hiển thị bảng trống)
        hienThiGioHang();

        // 6. Cập nhật tổng tiền về 0
        const tongTienElement = document.getElementById("tongTien");
        if (tongTienElement) {
            tongTienElement.textContent = "Tổng tiền: 0 ₫";
        }

        alert("Đã xóa toàn bộ giỏ hàng!");
    }
}
// Hàm xử lý thanh toán và tạo mã QR


// Hàm chạy khi người dùng nhấn "Tôi đã chuyển khoản xong"
function hoanTatThanhToan() {
    alert("Cảm ơn bạn! Hệ thống đang xác nhận giao dịch.");
    gioHang = []; // Làm trống giỏ hàng sau khi mua xong
    luuGioHang(); // Xóa sạch bộ nhớ giỏ hàng trong máy
    window.location.href = "index.html"; // Chuyển người dùng về lại trang chủ
}

// Hàm cập nhật con số nhỏ nhỏ trên biểu tượng giỏ hàng (Badge)
function capNhatBadgeGioHang() {
    const gioHangHT = JSON.parse(localStorage.getItem("gioHang")) || [];
    // Tính tổng số lượng tất cả các sản phẩm đang có
    const tongSoLuong = gioHangHT.reduce((total, item) => total + item.soLuong, 0);
    const badge = document.getElementById("cart-count"); // Tìm thẻ span hiện số giỏ hàng
    if (badge) {
        badge.innerText = tongSoLuong; // Ghi con số mới vào
    }
}

// Lắng nghe sự kiện trang đã nạp xong để cập nhật con số giỏ hàng ngay lập tức
document.addEventListener("DOMContentLoaded", capNhatBadgeGioHang);

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

// Hàm kiểm tra trạng thái đăng nhập trên trang giỏ hàng
function kiemTraDangNhapGioHang() {
    // Lấy dữ liệu người dùng từ LocalStorage
    const nguoiDungHienTai = JSON.parse(localStorage.getItem("currentUser"));
    const authButtons = document.getElementById('auth-buttons');

    if (nguoiDungHienTai && authButtons) {
        // Nếu đã đăng nhập: Ẩn nút đăng nhập/đăng ký, hiện nút đăng xuất
        const loginBtn = authButtons.querySelector('.login');
        const registerBtn = authButtons.querySelector('.register');
        const logoutBtn = authButtons.querySelector('.logout');

        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    }
    // Luôn cập nhật số lượng giỏ hàng nếu có hàm này
    if (typeof capNhatBadgeGioHang === "function") {
        capNhatBadgeGioHang();
    }
}

// Chạy hàm kiểm tra trạng thái đăng nhập khi trang giỏ hàng tải xong
document.addEventListener("DOMContentLoaded", function() {
    kiemTraDangNhapGioHang();
    // Các hàm khác có thể thêm vào đây
});



function thanhToan() {
    // 1. Kiểm tra đăng nhập
    const nguoiDungHienTai = JSON.parse(localStorage.getItem("currentUser"));

    if (!nguoiDungHienTai) {
        // Nếu chưa đăng nhập
        alert("Vui lòng đăng nhập để thực hiện thanh toán!");
        
        // Tùy chọn: Tự động mở khung đăng nhập nếu bạn dùng hàm openAuth từ main.js
        openAuth('login');
        return; // Dừng hàm, không cho thanh toán tiếp
    }

    // 2. Kiểm tra giỏ hàng có trống không
    if (gioHang.length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        return;
    }

    // 3. Nếu đã đăng nhập và có hàng, tiến hành xử lý thanh toán (Ví dụ: hiện mã QR)
    alert("Xác nhận đơn hàng thành công! Đang chuyển đến trang thanh toán...");
    
    // Tính toán lại tổng số tiền cuối cùng sau giảm giá
    const tongTien = gioHang.reduce((s, i) => s + i.soLuong * i.price, 0);
    const finalAmount = Math.max(0, tongTien - appliedDiscount);

    // THÔNG TIN TÀI KHOẢN NGÂN HÀNG NHẬN TIỀN
    const BANK_ID = "vcb"; // Vietcombank
    const ACCOUNT_NO = "9975348611"; // Số tài khoản của bạn
    const ACCOUNT_NAME = "NGUYEN VAN THUAN"; // Tên chủ tài khoản

    // Tạo đường dẫn API VietQR để tự động tạo ảnh QR kèm số tiền và nội dung chuyển khoản
    const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.jpg?amount=${finalAmount}&addInfo=${encodeURIComponent('Thanh toan don hang ')}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

    // Gán link ảnh vừa tạo vào thẻ img trong Modal thanh toán
    document.getElementById("qrImage").src = qrUrl;
    // Hiển thị số tiền cần trả lên màn hình thanh toán
    document.getElementById("qrAmount").innerText = "Số tiền: " + formatVND(finalAmount);
    // Mở cửa sổ Modal hiện mã QR lên
    document.getElementById("qrModal").style.display = "block";
}

// Hàm áp dụng mã giảm giá
function applyDiscount() {
    const code = document.getElementById('discount-code').value.trim().toUpperCase();
    const messageElement = document.getElementById('discount-message');

    if (code === 'CUOINAM20') {
        // Tính tổng tiền hiện tại
        const tongTien = gioHang.reduce((s, i) => s + i.soLuong * i.price, 0);
        // Giảm giá 20%
        appliedDiscount = Math.round(tongTien * 0.2);
        messageElement.textContent = 'Mã giảm giá áp dụng thành công!';
        messageElement.style.color = 'green';
        // Cập nhật hiển thị
        updateFinalTotal(tongTien);
    } else {
        appliedDiscount = 0;
        messageElement.textContent = 'Mã giảm giá không hợp lệ!';
        messageElement.style.color = 'red';
        // Ẩn các phần giảm giá
        document.getElementById('discount-amount').style.display = 'none';
        document.getElementById('final-total').style.display = 'none';
    }
}

// Hàm cập nhật tổng thanh toán sau giảm giá
function updateFinalTotal(tongTien) {
    const discountAmountElement = document.getElementById('discount-amount');
    const finalTotalElement = document.getElementById('final-total');

    if (appliedDiscount > 0) {
        const finalAmount = Math.max(0, tongTien - appliedDiscount);
        discountAmountElement.textContent = `Giảm giá: -${formatVND(appliedDiscount)}`;
        discountAmountElement.style.display = 'block';
        finalTotalElement.textContent = `Tổng thanh toán: ${formatVND(finalAmount)}`;
        finalTotalElement.style.display = 'block';
    } else {
        discountAmountElement.style.display = 'none';
        finalTotalElement.style.display = 'none';
    }
}
