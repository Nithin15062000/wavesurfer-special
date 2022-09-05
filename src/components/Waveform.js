import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useReducer,
  useRef,
  useState,
} from "react";
import "./Waveform.css";
import WaveKiller from "./WaveKiller.library";
import { playerEventReducer } from "./Waveform.utils";
//import WaveKiller from "./WaveKiller.class";
/**
 * @typedef {Object} waveformParam
 * @property {string} url : pass the url of the component
 * @property {boolean} editMode : edit mode enable
 * @property {regions} regions : regions
 */

/**
 * this
 * @param {waveformParam} props
 */
function Waveform(props, ref) {
  /**
   * ## this constains wave object
   *   @type {WaveKiller}
   */
  let wavesurferObj;
  let setWavesurferObj;
  [wavesurferObj, setWavesurferObj] = useState();

  const [url, regions, editMode, chunk] = [
    props.url,
    props.regions,
    props.editMode,
    props.chunk,
  ];
  const wavesurferRef = useRef();
  const timelineRef = useRef();
  const [playerEvents, dispatchPlayerEvents] = useReducer(playerEventReducer, {
    zoom: 1,
    volume: 0.5,
    play: false,
    speed: 1,
    speaker: "bot",
  });

  // initiate the waveform
  //--------------------------–––––––––––------–––––––--–--------------
  useEffect(() => {
    if (wavesurferRef.current && !wavesurferObj) {
      let obj = new WaveKiller(wavesurferRef.current, timelineRef.current);
      setWavesurferObj((e) => {
        if (e) {
          //   console.log(" wave destroyed");
          e.obj.destroy();
        }
        // console.log("wave Resetted");
        return obj;
      });
    }
  }, [wavesurferRef, wavesurferObj]);
  // ------------------------------------------------------------------
  // loading the object url
  useEffect(() => {
    if (wavesurferObj) {
      if (url) {
        wavesurferObj.load(url);
        wavesurferObj.pause();
      }
    }
  }, [wavesurferObj, url]);
  // ------------------------------------------------------–––––––––---
  // updating the regions when props region change
  useEffect(() => {
    if (wavesurferObj && !editMode.isEditMode) {
      wavesurferObj.renderRegions(regions);
    }
    //console.log(regions, "Regions");
  }, [wavesurferObj, regions, editMode.isEditMode]);
  useEffect(() => {
    if (editMode.isEditMode) {
      if (editMode.id) {
        wavesurferObj.renderEditRegions(editMode.id);
      }
    }
  }, [editMode, wavesurferObj]);
  // ------------------------------------------------------–––––––––---
  // audio events like pause play zoom
  useEffect(() => {
    if (wavesurferObj) {
      wavesurferObj.zoom(playerEvents.zoom);
    }
  }, [playerEvents.zoom, wavesurferObj]);
  //------ play pause
  useEffect(() => {
    if (wavesurferObj) {
      if (playerEvents.play) {
        wavesurferObj.play();
        console.log("Playing");
      } else {
        wavesurferObj.pause();
      }
    }
  }, [playerEvents.play, wavesurferObj]);
  //----- replay
  function resetPlaying() {
    if (wavesurferObj) {
      wavesurferObj.stop();
      if (playerEvents.play) {
        wavesurferObj.play();
      }
    }
  }
  //------ volume
  useEffect(() => {
    if (wavesurferObj) {
      //console.log(playerEvents.volume);
      wavesurferObj.setVolume(playerEvents.volume);
    }
  }, [playerEvents.volume, wavesurferObj]);
  //-------zoom
  useEffect(() => {
    if (wavesurferObj) {
      wavesurferObj.zoom(playerEvents.zoom);
    }
  }, [playerEvents.zoom, wavesurferObj]);
  //--------- zoom on resize
  useEffect(() => {
    function zoomOnResize() {
      if (wavesurferObj) {
        wavesurferObj.zoom(playerEvents.zoom);
        // console.log("resizing");
      }
    }
    window.addEventListener("resize", zoomOnResize);
    return () => {
      window.removeEventListener("resize", zoomOnResize);
    };
  }, [wavesurferObj, playerEvents.zoom]);
  //--------soeed
  useEffect(() => {
    if (wavesurferObj) {
      wavesurferObj.speed(playerEvents.speed);
    }
  }, [playerEvents.speed, wavesurferObj]);

  //----------------chunk
  function chunkCurrent(id) {
    const speaker = playerEvents.speaker;
    const [start, end] = wavesurferObj.getRegionTime("trimmer");
    if (!editMode.isEditMode) {
      chunk(start, end, speaker);
    }
  }
  //------- toggle speaker
  function fetchEditChunkInfo(id) {
    const [start, end] = wavesurferObj.getRegionTime(id);

    return { start, end, speaker: playerEvents.speaker };
  }

  useImperativeHandle(ref, () => ({
    fetchEditChunkInfo: fetchEditChunkInfo,
    setSpeaker: (e) => {
      dispatchPlayerEvents({ type: "SET_SPEAKER", payload: e });
    },
  }));

  return (
    <>
      <span id="tagger"></span>
      <div className="waveform-container">
        <div ref={wavesurferRef} id="waveform"></div>
      </div>
      <div className="timelinewrapper">
        <div ref={timelineRef} id="wave-timeline"></div>
      </div>
      <div className="controllers">
        <div>
          <button
            className={playerEvents.speaker}
            onClick={() => {
              dispatchPlayerEvents({ type: "TOGGLE_SPEAKER" });
            }}
          >
            {playerEvents.speaker}
          </button>
        </div>
        <button
          onClick={() => {
            chunkCurrent();
          }}
        >
          chunk
        </button>
        <button
          onClick={() => {
            dispatchPlayerEvents({ type: "TOGGLE_PLAY" });
          }}
        >
          Play
        </button>
        <button
          onClick={() => {
            resetPlaying();
          }}
        >
          replay
        </button>
        <div>
          {" "}
          <label>volume</label>
          <input
            type={"range"}
            onChange={(e) => {
              dispatchPlayerEvents({
                type: "SET_VOLUME",
                payload: e.target.value,
              });
            }}
            step={0.05}
            min={0}
            max={1}
            defaultValue={0.5}
          ></input>
        </div>
        <div>
          {" "}
          <label>zoom</label>
          <input
            type={"range"}
            onChange={(e) => {
              dispatchPlayerEvents({
                type: "SET_ZOOM",
                payload: e.target.value,
              });
            }}
            step={0.05}
            min={1}
            max={500}
            defaultValue={1}
          ></input>
        </div>
        <div>
          {" "}
          <label>speed</label>
          <input
            type={"range"}
            onChange={(e) => {
              dispatchPlayerEvents({
                type: "SET_SPEED",
                payload: e.target.value,
              });
            }}
            step={0.25}
            min={0.5}
            max={1.5}
            defaultValue={1}
          ></input>
        </div>
      </div>
    </>
  );
}

export default forwardRef(Waveform);
