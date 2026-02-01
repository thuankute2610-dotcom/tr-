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

            ${product.category === 'Trà' || product.category === 'Trà sữa' ? `
            <div class="sugar-section">
                <label>Độ ngọt:</label>
                <div class="sugar-options">
                    <label class="sugar-option">
                        <input type="radio" name="sugar-level" value="20" checked>
                        <span>20% đường</span>
                    </label>
                    <label class="sugar-option">
                        <input type="radio" name="sugar-level" value="50">
                        <span>50% đường</span>
                    </label>
                    <label class="sugar-option">
                        <input type="radio" name="sugar-level" value="70">
                        <span>70% đường</span>
                    </label>
                    <label class="sugar-option">
                        <input type="radio" name="sugar-level" value="100">
                        <span>100% đường</span>
                    </label>
                </div>
            </div>
            ` : ''}

            <div class="topping-section">
                <label>Chọn Topping (tối đa 3):</label>
                <div id="topping-list" class="topping-list"></div>
            </div>

            <div class="note-section">
                <label for="product-note">Ghi chú:</label>
                <textarea id="product-note" class="note-input" placeholder="Ví dụ: Ít đường, nhiều đá, không đá, v.v." rows="3"></textarea>
            </div>

            <div class="total-section">
                <span>Thành tiền:</span>
                <span id="total-price" class="total-amount">${formatVND(product.price)}</span>
            </div>

            <button class="btn-add" onclick="themVaoGio(${product.id})">THÊM VÀO GIỎ HÀNG</button>
            <button class="btn-pay-now" onclick="thanhToanNgay(${product.id})">THANH TOÁN NGAY</button>
        </div>
    `;

    // Thêm mô tả và thành phần sau khi render sản phẩm
    const detailInfo = document.querySelector('.detail-info');
    if (detailInfo && product.description) {
        const descriptionDiv = document.createElement('div');
        descriptionDiv.className = 'product-description';
        descriptionDiv.innerHTML = `
            <h3>Mô tả sản phẩm</h3>
            <p>${product.description}</p>
        `;
        detailInfo.appendChild(descriptionDiv);
    }

    if (detailInfo && product.ingredients) {
        const ingredientsDiv = document.createElement('div');
        ingredientsDiv.className = 'product-ingredients';
        const ingredientsList = product.ingredients.split(', ').map(ing => `<li>${ing.trim()}</li>`).join('');
        ingredientsDiv.innerHTML = `
            <h3>Thành phần</h3>
            <ul>${ingredientsList}</ul>
        `;
        detailInfo.appendChild(ingredientsDiv);
    }

    // Render danh sách topping (chỉ cho các sản phẩm không phải ăn vặt)
    const toppingList = document.getElementById('topping-list');
    if (toppingList && product.category !== 'Ăn vặt') {
        const toppings = danhSachHoa.filter(item => item.category === 'Topping');
        toppingList.innerHTML = toppings.map(topping => `
            <div class="topping-item">
                <input type="checkbox" id="topping-${topping.id}" value="${topping.id}" class="topping-checkbox">
                <label for="topping-${topping.id}">
                    <img src="${topping.img}" alt="${topping.name}" class="topping-image">
                    <div class="topping-info">
                        <span class="topping-name">${topping.name}</span>
                        <span class="topping-price">+${formatVND(topping.price)}</span>
                    </div>
                </label>
            </div>
        `).join('');

        // Giới hạn số lượng topping được chọn (tối đa 3)
        const toppingCheckboxes = document.querySelectorAll('.topping-checkbox');
        toppingCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const checkedBoxes = document.querySelectorAll('.topping-checkbox:checked');
                if (checkedBoxes.length > 3) {
                    this.checked = false;
                    alert('Bạn chỉ được chọn tối đa 3 topping!');
                }
                capNhatTongTien();
            });
        });
    } else if (toppingList && product.category === 'Ăn vặt') {
        // Ẩn phần topping cho món ăn vặt
        toppingList.style.display = 'none';
        const toppingSection = document.querySelector('.topping-section');
        if (toppingSection) {
            toppingSection.style.display = 'none';
        }
    }

    // --- LOGIC CẬP NHẬT GIÁ TỨC THÌ ---
    // Lấy phần tử ô nhập số lượng và phần tử hiển thị tổng tiền vừa tạo ở trên
    const inputSl = document.getElementById(`sl-${product.id}`);
    const totalPriceDisplay = document.getElementById("total-price");

    // Lắng nghe mỗi khi người dùng thay đổi số lượng (gõ phím hoặc bấm mũi tên)
    inputSl.addEventListener("input", function() {
        let sl = parseInt(this.value);
        // Nếu người dùng xóa hết số hoặc nhập số nhỏ hơn 1, mặc định quay về 1
        if (isNaN(sl) || sl < 1) sl = 1;

        capNhatTongTien();
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

// Hàm đăng xuất dùng chung cho các trang (Đã thêm xác nhận)
// Hàm đăng xuất dùng chung cho các trang
function handleLogout() {
    // Thêm bước xác nhận bằng confirm()
    const logOutConfirm = confirm("Bạn có chắc chắn muốn thoát không?");

    if (logOutConfirm) {
        localStorage.removeItem("currentUser");
        // Sau khi đăng xuất, tải lại trang để quay về trạng thái ban đầu
        window.location.reload();
    }
}
function thanhToanNgay(id) {
    // 1. Kiểm tra đăng nhập
    const nguoiDungHienTai = JSON.parse(localStorage.getItem("currentUser"));

    if (!nguoiDungHienTai) {
        // Nếu chưa đăng nhập
        alert("Vui lòng đăng nhập để thực hiện thanh toán!");
        // Tùy chọn: Tự động mở khung đăng nhập nếu bạn dùng hàm openAuth từ main.js
        openAuth('login');
        return; // Dừng hàm, không cho thanh toán tiếp
    }

    // 2. Lấy số lượng từ ô input
    const slInput = document.getElementById(`sl-${id}`);
    const sl = slInput ? Number(slInput.value) : 1;

    // 3. Lấy danh sách topping đã chọn
    const checkedToppings = document.querySelectorAll('.topping-checkbox:checked');
    const selectedToppings = Array.from(checkedToppings).map(checkbox => {
        const toppingId = parseInt(checkbox.value);
        return danhSachHoa.find(t => t.id === toppingId);
    }).filter(t => t);

    // 4. Tính tổng tiền cho sản phẩm này + topping
    let tongTien = sl * product.price;
    selectedToppings.forEach(topping => {
        tongTien += sl * topping.price;
    });

    // 5. Hiển thị modal QR thanh toán
    // THÔNG TIN TÀI KHOẢN NGÂN HÀNG NHẬN TIỀN
    const BANK_ID = "vcb"; // Vietcombank
    const ACCOUNT_NO = "9975348611"; // Số tài khoản của bạn
    const ACCOUNT_NAME = "NGUYEN VAN THUAN"; // Tên chủ tài khoản

    // Tạo đường dẫn API VietQR để tự động tạo ảnh QR kèm số tiền và nội dung chuyển khoản
    const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.jpg?amount=${tongTien}&addInfo=${encodeURIComponent('Thanh toan san pham ' + product.name)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

    // Gán link ảnh vừa tạo vào thẻ img trong Modal thanh toán
    document.getElementById("qrImage").src = qrUrl;
    // Hiển thị số tiền cần trả lên màn hình thanh toán
    document.getElementById("qrAmount").innerText = "Số tiền: " + formatVND(tongTien);
    // Mở cửa sổ Modal hiện mã QR lên
    document.getElementById("qrModal").style.display = "block";
}

// Hàm thêm vào giỏ hàng với topping
function themVaoGio(id) {
    // Lấy số lượng từ ô input
    const slInput = document.getElementById(`sl-${id}`);
    const sl = slInput ? Number(slInput.value) : 1;

    // Lấy danh sách topping đã chọn
    const checkedToppings = document.querySelectorAll('.topping-checkbox:checked');
    const selectedToppings = Array.from(checkedToppings).map(checkbox => {
        const toppingId = parseInt(checkbox.value);
        return danhSachHoa.find(t => t.id === toppingId);
    }).filter(t => t);

    // Tạo đối tượng sản phẩm với topping
    const sanPhamVoiTopping = {
        ...product,
        soLuong: sl,
        toppings: selectedToppings
    };

    // Thêm vào giỏ hàng (sử dụng hàm từ cart.js)
    if (typeof themVaoGioTuDetail === "function") {
        themVaoGioTuDetail(sanPhamVoiTopping);
    } else {
        // Fallback: thêm vào localStorage trực tiếp
        let gioHang = JSON.parse(localStorage.getItem("gioHang")) || [];
        const itemIndex = gioHang.findIndex(item => item.id === id && JSON.stringify(item.toppings) === JSON.stringify(selectedToppings));

        if (itemIndex > -1) {
            gioHang[itemIndex].soLuong += sl;
        } else {
            gioHang.push(sanPhamVoiTopping);
        }

        localStorage.setItem("gioHang", JSON.stringify(gioHang));
        if (typeof capNhatBadgeGioHang === "function") {
            capNhatBadgeGioHang();
        }
        alert("Đã thêm vào giỏ hàng!");
    }
}

// Hàm cập nhật tổng tiền khi thay đổi số lượng hoặc topping
function capNhatTongTien() {
    const slInput = document.getElementById(`sl-${product.id}`);
    const sl = slInput ? Number(slInput.value) : 1;
    const totalPriceDisplay = document.getElementById("total-price");

    if (totalPriceDisplay) {
        let tongTien = sl * product.price;

        // Thêm giá topping nếu có
        if (product.category !== 'Ăn vặt') {
            const checkedToppings = document.querySelectorAll('.topping-checkbox:checked');
            const selectedToppings = Array.from(checkedToppings).map(checkbox => {
                const toppingId = parseInt(checkbox.value);
                return danhSachHoa.find(t => t.id === toppingId);
            }).filter(t => t);

            selectedToppings.forEach(topping => {
                tongTien += sl * topping.price;
            });
        }

        totalPriceDisplay.innerText = formatVND(tongTien);
    }
}

function renderProducts(data) {
    const container = document.getElementById('cacLoaiHoa');
    container.innerHTML = data.map(item => `
        <div class="product-card">
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p class="product-price">${item.price.toLocaleString()} VNĐ</p>

            <div class="product-info">
                <p class="desc"><strong>Mô tả:</strong> ${item.description}</p>
                <p class="ingr"><strong>Thành phần:</strong> <em>${item.ingredients}</em></p>
            </div>

            <button onclick="addToCart(${item.id})">Thêm vào giỏ</button>
        </div>
    `).join('');
}
