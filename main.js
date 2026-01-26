// --- QUẢN LÝ MODAL (Cửa sổ bật lên) ---

// Hàm mở cửa sổ Đăng nhập hoặc Đăng ký
function openAuth(type) {
    const modal = document.getElementById('auth-modal'); // Tìm thẻ chứa toàn bộ Modal
    if (modal) {
        // 1. Dùng vòng lặp xóa sạch các nội dung người dùng đã nhập trước đó trong các ô input
        const inputs = modal.querySelectorAll('input');
        inputs.forEach(input => input.value = "");

        // 2. Kích hoạt hiển thị Modal bằng kiểu 'flex' để căn giữa màn hình
        modal.style.display = 'flex';
        
        // 3. Kiểm tra biến 'type': Nếu là 'login' thì hiện form đăng nhập, ẩn form đăng ký và ngược lại
        document.getElementById('login-form').style.display = (type === 'login') ? 'block' : 'none';
        document.getElementById('register-form').style.display = (type === 'register') ? 'block' : 'none';
    }
}

// Hàm đóng cửa sổ Modal khi nhấn nút X
function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.style.display = 'none'; // Ẩn modal đi
}

// Lắng nghe sự kiện click trên toàn bộ cửa sổ trình duyệt
window.onclick = function(event) {
    const modal = document.getElementById('auth-modal');
    // Nếu người dùng click vào vùng trống bên ngoài hộp Modal thì cũng tự động đóng lại
    if (event.target == modal) modal.style.display = "none";
}

// --- ĐĂNG KÝ TÀI KHOẢN ---

function handleRegister() {
    // Lấy dữ liệu từ các ô nhập liệu và dùng .trim() để loại bỏ khoảng trắng thừa
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value.trim();

    // Kiểm tra xem người dùng có để trống ô nào không
    if (!name || !email || !pass) return alert("Vui lòng nhập đủ thông tin!");

    // Tạo một đối tượng chứa thông tin người dùng
    const user = { name, email, pass };
    // Lưu thông tin vào LocalStorage với khóa là "user_email" để không bị trùng lặp
    localStorage.setItem(`user_${email}`, JSON.stringify(user));
    alert("Đăng ký thành công! Hãy đăng nhập.");
    // Chuyển sang giao diện đăng nhập ngay sau khi đăng ký xong
    openAuth('login');
}

// --- ĐĂNG NHẬP ---

function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-pass').value.trim();

    // Tìm kiếm xem trong bộ nhớ có tài khoản ứng với email này không
    const savedUser = localStorage.getItem(`user_${email}`);
    if (savedUser) {
        const user = JSON.parse(savedUser); // Chuyển chuỗi JSON ngược thành đối tượng JS
        if (user.pass === pass) { // Kiểm tra mật khẩu có khớp không
            // Nếu đúng, lưu thông tin người dùng hiện tại vào khóa "currentUser"
            localStorage.setItem("currentUser", JSON.stringify(user));
            alert("Đăng nhập thành công!");
            location.reload(); // Tải lại trang để cập nhật giao diện thành "Chào, [Tên]"
        } else {
            alert("Sai mật khẩu!");
        }
    } else {
        alert("Tài khoản không tồn tại!");
    }
}

// --- ĐĂNG XUẤT ---

function handleLogout() {
    localStorage.removeItem("currentUser"); // Xóa bỏ trạng thái đăng nhập
    location.reload(); // Tải lại trang để quay về giao diện ban đầu
}

// --- KIỂM TRA TRẠNG THÁI KHI TRANG TẢI XONG (DOM) ---



document.addEventListener("DOMContentLoaded", () => {
    // 1. Kiểm tra nếu đang ở trang chủ thì gọi hàm hiển thị danh sách sản phẩm
    if (typeof hienThiHoa === "function" && document.getElementById("cacLoaiHoa")) {
        hienThiHoa();
    }

    // 2. Kiểm tra xem người dùng đã đăng nhập hay chưa
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const authButtons = document.getElementById('auth-buttons'); // Vùng chứa nút Đăng nhập/Đăng ký
    
    if (user && authButtons) {
        // Nếu đã đăng nhập, thay đổi nút Đăng nhập/Đăng ký thành lời chào và nút Đăng xuất
        authButtons.innerHTML = `
            <span style="color:white; font-weight:bold; margin-right:10px;">Chào, ${user.name}</span>
            <button class="btn-auth login" onclick="handleLogout()">Đăng xuất</button>
            <a href="cart.html" class="btn-nav btn-cart">🛒 Giỏ hàng <span id="cart-count">0</span></a>
        `;
    }

    // 3. Cập nhật con số trên giỏ hàng dựa theo dữ liệu hiện có
    if (typeof capNhatBadgeGioHang === "function") {
        capNhatBadgeGioHang();
    }
});