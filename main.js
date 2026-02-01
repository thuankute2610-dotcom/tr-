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

    // Kiểm tra email phải có định dạng @gmail.com
    if (!email.endsWith('@gmail.com')) {
        return alert("Email phải có định dạng @gmail.com!");
    }

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
        // Nếu tài khoản không tồn tại, tự động chuyển sang form đăng ký
        alert("Tài khoản không tồn tại! Chuyển sang đăng ký.");
        openAuth('register');
        // Điền sẵn email vào form đăng ký để tiện lợi
        setTimeout(() => {
            document.getElementById('reg-email').value = email;
        }, 100);
    }
}

// Hàm định dạng số thành tiền tệ Việt Nam (ví dụ: 1000000 -> 1.000.000 ₫)
function formatVND(tien) {
    return Number(tien).toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

// --- TÌM KIẾM SẢN PHẨM ---

// Hàm tìm kiếm sản phẩm
function searchProducts() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim().toLowerCase(); // Lấy từ khóa tìm kiếm và chuyển về chữ thường

    if (!query) {
        // Nếu không có từ khóa, hiển thị tất cả sản phẩm
        if (typeof hienThiHoa === "function") {
            hienThiHoa();
        }
        return;
    }

    // Lọc sản phẩm dựa trên từ khóa (tìm trong tên sản phẩm)
    const filteredProducts = danhSachHoa.filter(product =>
        product.name.toLowerCase().includes(query)
    );

    // Hiển thị kết quả tìm kiếm
    const container = document.getElementById('cacLoaiHoa');
    if (container) {
        if (filteredProducts.length === 0) {
            // Nếu không tìm thấy sản phẩm nào
            container.innerHTML = `
                <div style="text-align: center; padding: 50px; color: #666;">
                    <h2>Không tìm thấy sản phẩm nào</h2>
                    <p>Vui lòng thử từ khóa khác</p>
                    <button onclick="document.getElementById('search-input').value=''; searchProducts();" style="padding: 10px 20px; background: #ff8c00; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Hiển thị tất cả sản phẩm
                    </button>
                </div>
            `;
        } else {
            // Hiển thị danh sách sản phẩm tìm được
            container.innerHTML = filteredProducts.map(product => `
                <div class="flower-card">
                    <img src="${product.img}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p class="product-price">${formatVND(product.price)}</p>

                    <div class="product-info">
                        <p class="desc"><strong>Mô tả:</strong> ${product.description}</p>
                        <p class="ingr"><strong>Thành phần:</strong> <em>${product.ingredients}</em></p>
                    </div>

                    <input type="number" value="1" min="1" class="input-quantity">
                    <button onclick="window.location.href='detail.html?id=${product.id}'">Xem chi tiết</button>
                </div>
            `).join('');
        }
    }
}

// --- ĐĂNG XUẤT ---

// --- CẬP NHẬT TRONG main.js ---

// 1. Sửa lại hàm handleLogout để thêm xác nhận
// --- ĐĂNG XUẤT ---
function handleLogout() {
    // Hiển thị hộp thoại xác nhận trước khi thực hiện đăng xuất
    const logOutConfirm = confirm("Bạn có chắc chắn muốn đăng xuất không?");

    if (logOutConfirm) {
        localStorage.removeItem("currentUser"); // Xóa bỏ trạng thái đăng nhập
        location.reload(); // Tải lại trang để quay về giao diện ban đầu
    }
}
// 2. Đảm bảo nút trong giỏ hàng gọi đúng hàm này
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const authButtons = document.getElementById('auth-buttons');

    if (user && authButtons) {
        authButtons.innerHTML = `
            <span id="user-greeting">Chào, ${user.name}</span>
            <button class="btn-auth login" onclick="handleLogout()">Đăng xuất</button>
            <a href="cart.html" class="btn-nav btn-cart">🛒 Giỏ hàng <span id="cart-count">0</span></a>
        `;
    }
    // ... các code khác
});



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
            <span id="user-greeting">Chào, ${user.name}</span>
            <button class="btn-auth login" onclick="handleLogout()">Đăng xuất</button>
            <a href="cart.html" class="btn-nav btn-cart">🛒 Giỏ hàng <span id="cart-count">0</span></a>
        `;
    }

    // 3. Cập nhật con số trên giỏ hàng dựa theo dữ liệu hiện có
    if (typeof capNhatBadgeGioHang === "function") {
        capNhatBadgeGioHang();
    }

    // 4. Thêm event listener cho ô tìm kiếm
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchProducts();
        });
    }
});
