const imageWrapper = document.querySelector(".images");
const searchInput = document.querySelector(".search input");
const loadMoreBtn = document.querySelector(".gallery .load-more");
const lightbox = document.querySelector(".lightbox");
const downloadImgBtn = lightbox.querySelector(".uil-import");
const closeImgBtn = lightbox.querySelector(".close-icon");

const perPage = 15;
let currentPage = 1;
let searchTerm = null;

// Securely fetch the API key from a server or environment variable
const getApiKey = async () => {
    try {
        const response = await fetch("/get-api-key"); // Replace with your API endpoint
        const data = await response.json();
        return data.apiKey; // Ensure your server returns { "apiKey": "your_api_key" }
    } catch (error) {
        console.error("Failed to fetch API key!", error);
        return null;
    }
};

const downloadImg = (imgUrl) => {
    fetch(imgUrl).then(res => res.blob()).then(blob => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = new Date().getTime();
        document.body.appendChild(a);
        a.click();
        a.remove();
    }).catch(() => console.log("Failed to download image!"));
};

const showLightbox = (name, img) => {
    lightbox.querySelector("img").src = img;
    lightbox.querySelector("span").innerText = name;
    downloadImgBtn.setAttribute("data-img", img);
    lightbox.classList.add("show");
    document.body.style.overflow = "hidden";
};

const hideLightbox = () => {
    lightbox.classList.remove("show");
    document.body.style.overflow = "auto";
};

const generateHTML = (images) => {
    imageWrapper.innerHTML += images.map(img => 
        `<li class="card">
            <img onclick="showLightbox('${img.photographer}', '${img.src.large2x}')" src="${img.src.large2x}" alt="img">
            <div class="details">
                <div class="photographer">
                    <i class="uil uil-camera"></i>
                    <span>${img.photographer}</span>
                </div>
                <button onclick="downloadImg('${img.src.large2x}');">
                    <i class="uil uil-import"></i>
                </button>
            </div>
        </li>`
    ).join("");
};

const getImages = async (apiURL) => {
    searchInput.blur();
    loadMoreBtn.innerText = "Loading...";
    loadMoreBtn.classList.add("disabled");
    const apiKey = await getApiKey(); // Fetch the API key dynamically
    if (!apiKey) return console.error("API key is missing!");

    fetch(apiURL, {
        headers: { Authorization: apiKey }
    }).then(res => res.json()).then(data => {
        generateHTML(data.photos);
        loadMoreBtn.innerText = "Load More";
        loadMoreBtn.classList.remove("disabled");
    }).catch(() => console.log("Failed to load images!"));
};

const loadMoreImages = () => {
    currentPage++;
    let apiUrl = `https://api.pexels.com/v1/curated?page=${currentPage}&per_page=${perPage}`;
    apiUrl = searchTerm ? `https://api.pexels.com/v1/search?query=${searchTerm}&page=${currentPage}&per_page=${perPage}` : apiUrl; 
    getImages(apiUrl);
};

const loadSearchImages = (e) => {
    if(e.target.value === "") return searchTerm = null;
    if(e.key === "Enter") {
        currentPage = 1;
        searchTerm = e.target.value;
        imageWrapper.innerHTML = "";
        getImages(`https://api.pexels.com/v1/search?query=${searchTerm}&page=1&per_page=${perPage}`);
    }
};

// Initialize the app
getImages(`https://api.pexels.com/v1/curated?page=${currentPage}&per_page=${perPage}`);
loadMoreBtn.addEventListener("click", loadMoreImages);
searchInput.addEventListener("keyup", loadSearchImages);
closeImgBtn.addEventListener("click", hideLightbox);
downloadImgBtn.addEventListener("click", (e) => downloadImg(e.target.dataset.img));
