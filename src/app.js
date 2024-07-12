document.addEventListener("alpine:init", () => {
  Alpine.data("products", () => ({
    items: [
      { id: 1, name: "Salad Buah Small 450 ml", img: "1.jpg", price: 15000 },
      { id: 2, name: "Salad Buah Medium 550 ml", img: "2.jpg", price: 20000 },
      { id: 3, name: "Salad Buah Large 650 ml", img: "3.jpg", price: 25000 },
      { id: 4, name: "Es Buah", img: "4.jpg", price: 13000 },
      { id: 5, name: "Jus Jeruk", img: "5.jpg", price: 12000 },
      { id: 6, name: "Jus Alpukat", img: "6.jpg", price: 12000 },
      { id: 7, name: "Jus Mangga", img: "7.jpg", price: 12000 },
      { id: 8, name: "Jus Jambu", img: "8.jpeg", price: 12000 },
      { id: 9, name: "Jus Melon", img: "9.jpeg", price: 12000 },
      { id: 10, name: "Jus Lemon", img: "10.jpg", price: 12000 },
      { id: 11, name: "Jus Sirsak", img: "11.jpg", price: 12000 },
      { id: 12, name: "Jus Naga", img: "12.jpeg", price: 12000 },
      { id: 13, name: "Jus Apel", img: "13.jpeg", price: 12000 },
      { id: 14, name: "Jus Nanas", img: "14.jpg", price: 12000 },
      { id: 15, name: "Jus Strawberry", img: "15.jpg", price: 12000 },
    ],

    toggle() {
      this.open = !this.open;
    },
  }));

  Alpine.store("cart", {
    items: [],
    total: 0,
    quantity: 0,

    add(newItem) {
      // cek apakah ada barang yang sama di cart
      const cartItem = this.items.find((item) => item.id === newItem.id);

      // jika belum ada atau cart masih kosong
      if (!cartItem) {
        this.items.push({ ...newItem, quantity: 1, total: newItem.price });
        this.quantity++;
        this.total += newItem.price;
      } else {
        //jika barang sudah ada, di cek apakah abrang beda atau sama dengan yang ada di cart
        this.items = this.items.map((item) => {
          //jika barang beda
          if (item.id !== newItem.id) {
            return item;
          } else {
            // jika barang sudah ada, tambah quantity dan totalnya
            item.quantity++;
            item.total = item.price * item.quantity;
            this.quantity++;
            this.total += item.price;
            return item;
          }
        });
      }
    },

    remove(id) {
      // ambil item yang mau di remove berdasarkan id nya

      const cartItem = this.items.find((item) => item.id === id);

      // jika item lebih dari 1

      if (cartItem.quantity > 1) {
        // telusuri 1 1
        this.items = this.items.map((item) => {
          // jika bukan barang yang di klik
          if (item.id !== id) {
            return item;
          } else {
            item.quantity--;
            item.total = item.price * item.quantity;
            this.quantity--;
            this.total -= item.price;
            return item;
          }
        });
      } else if (cartItem.quantity === 1) {
        // jika barang sisa 1
        this.items = this.items.filter((item) => item.id !== id);
        this.quantity--;
        this.total -= cartItem.price;
      }
    },

    toggle() {
      this.on = !this.on;
    },
  });
});

// form validation

const checkoutButton = document.querySelector(".checkout-button");
checkoutButton.disabled = true;

const form = document.querySelector("#checkoutForm");

form.addEventListener("keyup", function () {
  for (let i = 0; i < form.elements.length; i++) {
    if (form.elements[i].value.length !== 0) {
      checkoutButton.classList.remove("disabled");
      checkoutButton.classList.add("disabled");
    } else {
      return false;
    }
  }

  checkoutButton.disabled = false;
  checkoutButton.classList.remove("disabled");
});

// kirim data ke wa ketika tombol checkout ditekan
checkoutButton.addEventListener("click", async function (e) {
  e.preventDefault();
  const formData = new FormData(form);
  const data = new URLSearchParams(formData);
  const objData = Object.fromEntries(data);
  // const message = formatMessage(objData);
  // window.open("http://wa.me/6289501283736?text=" + encodeURIComponent(message));

  //minta transaction token menggunakan ajax / fench
  try {
    const response = await fetch("php/placeOrder.php", {
      method: "POST",
      body: data,
    });

    const token = await response.text();
    // console.log(token);
    window.snap.pay(token);
  } catch (err) {
    console.log(err.message);
  }
});

// format pesan wa
const formatMessage = (obj) => {
  const items = JSON.parse(obj.items);
  return `Data Customer
    Nama : ${obj.name}
    Email: ${obj.email}
    No HP: ${obj.phone}

  Data Pesanan
  ${items
    .map((item) => `${item.name} (${item.quantity} X ${rupiah(item.total)})`)
    .join("\n")}
  
  TOTAL: ${rupiah(obj.total)}
  Terima Kasih.`;
};

document
  .getElementById("contactForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;

    const message = `Data Customer:
Nama: ${name}
Email: ${email}
No HP: ${phone}

Terima Kasih.`;

    const whatsappUrl = `https://wa.me/6289501283736?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank");
  });

//konversi ke rupiah

const rupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};
