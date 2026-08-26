const musicPlayer = document.querySelector("#music-player");

musicPlayer.setAttribute(
  "href",
  "https://spotify-github-profile.kittinanx.com/api/view?uid=11160815676&redirect=true",
);

const imgLight =
  "https://spotify-github-profile.kittinanx.com/api/view?uid=11160815676&cover_image=true&theme=spotify-embed&show_offline=false&background_color=121212&interchange=false&profanity=false&hide_remaster=true&bar_color=53b14f&bar_color_cover=false&mode=light";

const imgDark =
  "https://spotify-github-profile.kittinanx.com/api/view?uid=11160815676&cover_image=true&theme=spotify-embed&show_offline=false&background_color=121212&interchange=false&profanity=false&hide_remaster=true&bar_color=53b14f&bar_color_cover=false&mode=dark";

const placeholderLight = "/assets/media/content/musicplayer-img-l.png";
const placeholderDark = "/assets/media/content/musicplayer-img-d.png";

const placeholderImgLight = document.createElement("img");
placeholderImgLight.src = placeholderLight;
placeholderImgLight.alt = "What I'm listening to currently.";
placeholderImgLight.className = "light-music";

const placeholderImgDark = document.createElement("img");
placeholderImgDark.src = placeholderDark;
placeholderImgDark.alt = "What I'm listening to currently.";
placeholderImgDark.className = "dark-music";

musicPlayer.append(placeholderImgLight, placeholderImgDark);

const realImgLight = new Image();
realImgLight.alt = "What I'm listening to currently.";
realImgLight.className = "light-music";
realImgLight.onload = () => {
  musicPlayer.replaceChild(realImgLight, placeholderImgLight);
};
realImgLight.src = imgLight;

const realImgDark = new Image();
realImgDark.alt = "What I'm listening to currently.";
realImgDark.className = "dark-music";
realImgDark.onload = () => {
  musicPlayer.replaceChild(realImgDark, placeholderImgDark);
};
realImgDark.src = imgDark;

setInterval(() => {
  const imgs = musicPlayer.querySelectorAll(
    'img[src*="spotify-github-profile.kittinanx.com"]',
  );

  imgs.forEach((currentImg) => {
    const newSrc = currentImg.src.split("&t=")[0] + "&t=" + Date.now();

    const refreshed = new Image();
    refreshed.alt = currentImg.alt;
    refreshed.className = currentImg.className;
    refreshed.onload = () => {
      musicPlayer.replaceChild(refreshed, currentImg);
    };
    refreshed.onerror = () => {
      // keep showing the current image if the refresh fails
    };
    refreshed.src = newSrc;
  });
}, 5000);
