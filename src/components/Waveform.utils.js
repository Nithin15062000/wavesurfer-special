/**
 * @typedef {object} playerEvents
 * @property {number} zoom
 * @property {number} volume
 * @property {boolean} play
 * @property {number} speed
 */

/**
 * - zoom
 * - volume
 * - isPlaying
 * - stop
 * @param {playerEvents} e
 */
export function playerEventReducer(e, action) {
  switch (action.type) {
    case "SET_ZOOM":
      return { ...e, zoom: action.payload };
    case "SET_VOLUME":
      return { ...e, volume: action.payload };
    case "SET_PLAY":
      return { ...e, play: action.payload };
    case "SET_SPEED":
      return { ...e, speed: action.payload };
    case "TOGGLE_PLAY":
      return { ...e, play: !e.play };
    case "TOGGLE_SPEAKER":
      return { ...e, speaker: e.speaker === "customer" ? "bot" : "customer" };
    case "SET_SPEAKER":
      return { ...e, speaker: action.payload };
    default:
      return { e };
  }
}
