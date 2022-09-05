import { useEffect, useRef, useState } from "react";
import RegionsPlugin from "wavesurfer.js/src/plugin/regions";
import Wavesurfer from "wavesurfer.js";
import TimelinePlugin from "wavesurfer.js/src/plugin/timeline";

/**
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
function Waveform(props) {
  const [wavesurferObj, setWavesurferObj] = useState();

  const wavesurferRef = useRef();
  const timelineRef = useRef();
  const url = props;
  // initiate the waveform
  useEffect(() => {
    if (wavesurferRef.current && !wavesurferObj) {
      let obj = Wavesurfer.create({
        container: "#Waveform",
        autoCenter: true,
        cursorColor: "#9E9E9E",
        waveColor: "#5ff5b7",
        progressColor: "#5ff5b7",
        responsive: true,
        dragSelection: false,
        plugins: [
          TimelinePlugin.create({
            container: "#wave-timeline",
          }),
          // RegionsPlugin.create({ regions: [...regions] }),
          RegionsPlugin.create({}),
        ],
      });

      setWavesurferObj((prev) => obj);
    }
  }, [wavesurferRef]);
  useEffect(() => {
    if (wavesurferObj) {
      wavesurferObj.load(props?.url);
      wavesurferObj?.pause();
    }
  }, [wavesurferObj, url]);

  // Load the url

  return (
    <>
      <div className="waveform-container">
        <div ref={wavesurferRef} id="Waveform"></div>
      </div>
      <div className="timelinewrapper">
        <div ref={timelineRef} id="wave-timeline"></div>
      </div>
    </>
  );
}

export default Waveform;
