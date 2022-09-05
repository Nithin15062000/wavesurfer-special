import RegionsPlugin from "wavesurfer.js/src/plugin/regions";
import Wavesurfer from "wavesurfer.js";
import TimelinePlugin from "wavesurfer.js/src/plugin/timeline";
//import CursorPlugin from "wavesurfer.js/src/plugin/cursor";
/**
 * @typedef {Object} regions
 * @property {string} id
 * @property {number} start
 * @property {number} end
 * @property {boolean} drag
 * @property {boolean} loop
 * @property {boolean} resize
 */

/**
 * This is the module containing wavesurfer object and its custom methods for annotator tool
 * @example
 * const waveObj=new wavekiller(waveContainerRef.current,timeLineContainer.current,"green")
 * @property {function} updateRegions Used for resetting regions
 */
class WaveKiller {
  /**
   * wavesurfer obj
   *
   */
  obj;
  /**
   *@type {regions} regions
   */
  regions = [];
  maxTime = 0;
  editChunk = { start: null, end: null };
  /**
   * initiate the waveform
   */
  constructor(waveformContainer, timeLineContainer, color = "#5ff5b7") {
    this.obj = Wavesurfer.create({
      container: waveformContainer,
      autoCenter: true,
      cursorColor: "#9E9E9E",
      waveColor: color,
      responsive: true,
      dragSelection: false,
      progressColor: color,
      normalize: true,
      plugins: [
        TimelinePlugin.create({
          container: timeLineContainer,
        }),
        RegionsPlugin.create({}),
      ],
    });

    return this;
  }
  /**
   * Load the audio waveform
   */
  load(url) {
    this.obj.load(url);
  }
  pause() {
    this.obj.pause();
  }
  /**
   * use this to create new regions and also adding trimmer in non edit mode
   * @param {[{id:string,start:number ,end:number,user:"customer"|"bot"}]} regions
   */
  async renderRegions(regions) {
    await this.setMaxTime(regions);
    this.obj.clearRegions();
    this.regions.forEach((e) => {
      this.obj.addRegion({
        id: e.speaker + "-" + e.id,
        start: e.start,
        end: e.end,
        loop: true,
        drag: false,
        resize: false,
      });
      //  console.log(e, "logging regions");
    });
    this.obj.addRegion({
      id: "trimmer",
      start: this.maxTime,
      end: this.maxTime + 2,
      loop: true,
    });
    this.obj.on("region-updated", (e) => {
      const [start, end, id] = [e.start, e.end, e.id];
      const length = end - start;
      if (id === "trimmer" && start < this.maxTime) {
        e.start = this.maxTime + 0.5;
        e.end = this.maxTime + length + 0.5;
      }
    });
    this.obj.on("region-mouseenter", (e) => {
      // console.log("region-updated", e.id.split("-")[0]);
      if (e.id !== "trimmer") {
        const span = document.querySelector("#tagger");
        span.style.display = "block";
        span.innerText = e.id.split("-")[0];
        span.style.left =
          Math.floor(parseInt(e.element.style.width.slice(0, -2)) / 2) +
          parseInt(e.element.style.left.slice(0, -2)) +
          "px";
      }
    });
    this.obj.on("region-mouseleave", (e) => {
      const element = document.querySelector("#tagger");
      if (element) {
        element.style.display = "none";
      }
    });
  }
  async renderEditRegions(id) {
    const regions = this.obj.regions.list;
    let [start, end, currentId] = [0, 0, ""];
    for (let i in regions) {
      if (regions[i].id.includes(id)) {
        [start, end, currentId] = [
          regions[i].start,
          regions[i].end,
          regions[i].id,
        ];
        regions[i].remove();
      }
    }
    regions["trimmer"].remove();
    this.obj.addRegion({
      id: "edit" + "-" + currentId,
      start: start,
      end: end,
      resize: true,
      drag: false,
    });
    const [boundingStart, boundingEnd] = this.getBoundingTime(id);
    this.obj.on("region-updated", (e) => {
      // console.log(boundingStart, boundingEnd);
      if (e.id.includes(id)) {
        if (e.start < boundingStart) {
          e.start = boundingStart + 0.3;
        }
        if (e.end > boundingEnd) {
          e.end = boundingEnd - 0.3;
        }
      }
    });
  }
  /**
   *
   * @param {[regions]} regions
   * @returns
   */
  setMaxTime(regions) {
    const newThis = this;
    return new Promise(function (resolve) {
      newThis.regions = regions;
      regions.forEach((e) => {
        newThis.maxTime = Math.max(newThis.maxTime, e.end);
      });
      resolve();
    });
  }
  //--------------------- get region time
  getRegionTime(id) {
    const regions = this.obj.regions.list;
    for (let i in regions) {
      if (regions[i].id.includes(id)) {
        return [regions[i].start, regions[i].end];
      }
    }
  }
  getBoundingTime(id) {
    const regions = this.obj.regions.list;
    let [left, right] = [0, this.obj.getDuration()];
    let speaker;
    let start, end;
    for (let i in regions) {
      if (regions[i].id.includes(i)) {
        start = regions[i].start;
        end = regions[i].end;
        speaker = regions[i].id.includes("bot")
          ? "bot"
          : regions[i].id.includes("customer")
          ? "customer"
          : "none";
      }
    }
    //console.log(start, end, "this is start end");

    for (let i in regions) {
      if (regions[i].id.includes(speaker)) {
        if (start >= regions[i].end) {
          left = regions[i].end;
        }
        if (end <= regions[i].start) {
          right = regions[i].start;
        }
      }
    }
    //console.log(left, right, "left right");
    return [left, right];
  }
  playPause() {
    this.obj.playPause();
  }
  /**
   *
   * @param {number} e [0..1]
   */
  setVolume(e) {
    this.obj.setVolume(e);
  }
  stop() {
    this.obj.stop();
  }
  play() {
    this.obj.play();
  }
  zoom(e) {
    this.obj.zoom(e);
  }
  speed(e) {
    this.obj.setPlaybackRate(e);
  }
}

export default WaveKiller;
