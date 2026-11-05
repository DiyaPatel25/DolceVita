// Shop details shown on the website. Edit here; everything else reads from this.
export const STORE = {
  name: "Dolce Vita",
  tagline: "cakes and more",
  phones: ["9601370361", "6355651866"], // from the printed menu
  pickupPoint: "", // e.g. "Opposite XYZ Mall, CG Road, Ahmedabad" — leave empty to hide
  mapsUrl: "", // a Google Maps link to the stall — leave empty to hide
  hours: "", // e.g. "4 PM – 1 AM, every day" — leave empty to hide
};

// Short dessert clips (Pexels, free to use). Small 540p files so phones load them quickly.
export const VIDEOS = {
  heroSmall: "https://videos.pexels.com/video-files/30335428/13003585_360_640_30fps.mp4",
  heroLarge: "https://videos.pexels.com/video-files/30335428/13003586_540_960_30fps.mp4",
  reel: [
    { src: "https://videos.pexels.com/video-files/30129320/12920557_540_960_25fps.mp4", category: "Cheesecakes" },
    { src: "https://videos.pexels.com/video-files/31745144/13525405_540_960_30fps.mp4", category: "Brownies" },
    { src: "https://videos.pexels.com/video-files/36170482/15339277_540_960_30fps.mp4", category: "Waffles" },
    { src: "https://videos.pexels.com/video-files/31560124/13450347_540_960_25fps.mp4", category: "London Chocolate Strawberry" },
  ],
};
