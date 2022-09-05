import { useReducer, useState, useRef } from "react";
import "./App.css";
import Waveform from "./components/Waveform";
import { v4 as uuidv4 } from "uuid";
function regionsReducer(state, action) {
  switch (action.type) {
    case "ADD_REGION":
      return [...state, { ...action.payload, id: uuidv4() }];
    case "EDIT_REGION":
      return state.map((e) => {
        if (e.id === action.payload.id) {
          return { ...action.payload };
        } else {
          return e;
        }
      });
  }
}
function App() {
  const [regions, regionDispacher] = useReducer(regionsReducer, [
    { id: uuidv4(), start: 1, end: 4, speaker: "bot" },
    { id: uuidv4(), start: 8, end: 10, speaker: "customer" },
  ]);
  const [editMode, setEditMode] = useState({ isEditMode: false, id: null });

  const waveformRef = useRef();
  function chunk(start, end, speaker) {
    regionDispacher({ type: "ADD_REGION", payload: { start, end, speaker } });
  }
  function save(id) {
    if (waveformRef.current) {
      const { start, end, speaker } =
        waveformRef.current.fetchEditChunkInfo(id);
      regionDispacher({
        type: "EDIT_REGION",
        payload: { id, start, end, speaker },
      });
      console.log(start, end, speaker, "new data");
    }

    setEditMode(() => {
      return { isEditMode: false, id: null };
    });
  }
  function edit(id) {
    if (waveformRef.current) {
      if (!edit.isEditMode) {
        setEditMode(() => {
          return {
            isEditMode: true,
            id: id,
          };
        });
        let currentSpeaker;
        regions.map((e) => {
          if (e.id === id) {
            currentSpeaker = e.speaker;
          }
          return e;
        });
        // console.log(currentSpeaker, "speaker");
        waveformRef.current.setSpeaker(currentSpeaker);
      }
    } else {
      console.error("first commit the edit");
    }
  }
  return (
    <div className="App">
      <h1>Waveform</h1>
      <Waveform
        url={
          "http://ia902606.us.archive.org/35/items/shortpoetry_047_librivox/song_cjrg_teasdale_64kb.mp3"
        }
        regions={regions}
        editMode={editMode}
        chunk={chunk}
        ref={waveformRef}
      ></Waveform>
      {regions.map((e) => {
        return (
          <div key={e.id} className={e.speaker}>
            start:{e.start} end:{e.end}
            {editMode.isEditMode && editMode.id === e.id ? (
              <button
                onClick={() => {
                  save(e.id);
                }}
              >
                save
              </button>
            ) : (
              <button
                onClick={() => {
                  edit(e.id);
                }}
              >
                edit
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default App;
