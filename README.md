# EarthSound

**Listen to our changing planet.** EarthSound turns NASA Earth Information Center images into sound, so people can hear Earth data and not only see it. Made for the NASA Space Apps Challenge 2026, challenge "The Earth Information Jukebox".

**Team:** [SoloInnovator] (solo participant: Sachin Pal)
**Live demo:** https://sachinpal-pal.github.io/Earthsound/

## How it works
1. Pick one of six NASA Earth images, or upload your own.
2. A scan line moves from left to right across the image.
3. For each column, the app groups the pixel colours into classes and plays a sound for each class.
4. Notes are snapped to a musical scale (pentatonic, major or minor) so the result is pleasant to listen to.
5. Higher position in the image means higher pitch, for classes that use pitch.

Everything runs in the browser (HTML, CSS, JavaScript, Canvas API and Web Audio API). All sounds are synthesized live. No audio files are used.

## What each image sounds like
| Image | Sound rules (artistic mapping) |
|---|---|
| Forest height (GEDI) | Ocean: low drone. Vegetation: notes. Cloud or ice: airy wind. Land: soft low notes. |
| Carbon dioxide | Brown haze: low drone. Snow and cloud: wind. Dense orange plumes: crackle. |
| Night lights 2012 to 2023 | Purple (brighter): high chime. Orange (dimmer): low note. White (unchanged): soft note. |
| Sea surface | Each colour range has its own pitch: blue lowest, red highest. |
| Aerosols | Purple: deep drone. Green: wind. Orange and red: crackle. White: soft notes. |
| Lightning | Each lightning flash is a short blip. Clouds: wind. |

The mapping is an artistic ruleset that follows the colours of each visualization. It is not a measurement.

## Accessibility
- Full keyboard control (Space = play or pause, arrow keys = move the scan line, D = spoken description, ? = help)
- "Describe" button reads the image description and the current column aloud (Web Speech API)
- Live text readout of what is under the scan line
- High contrast mode, visible focus outlines, reduced-motion support
- Skip link and ARIA labels

## Data and credits
All images are stills from NASA's Scientific Visualization Studio (SVS), Earth Information Center collection. Credit: NASA's Scientific Visualization Studio.
- GEDI Forest Height: https://svs.gsfc.nasa.gov/4950/
- DYAMOND Global Carbon Dioxide: https://svs.gsfc.nasa.gov/5196/
- Change in Night Lights between 2012 and 2023, EIC Version: https://svs.gsfc.nasa.gov/5313/
- Global Sea Surface Currents and Temperature: https://svs.gsfc.nasa.gov/3912/
- GEOS Aerosols: https://svs.gsfc.nasa.gov/5669/
- Lightning Events Detected from the ISS 2017-2023: https://svs.gsfc.nasa.gov/5011/

Other resources:
- Fonts: Sora and JetBrains Mono from Google Fonts (SIL Open Font License)
- Web Audio API, Canvas API and Web Speech API (web standards)
- No other libraries or third-party code are used.

## Use of Super Intelligence (SI)
SI tools were used during the hackathon. Claude (Anthropic) was used to generate and explain the HTML, CSS and JavaScript code and to test and improve the colour-to-sound rules. The participant chose the challenge, the NASA images, the concept and the accessibility goals, tested every version in the browser, and decided which changes to keep.

## Run locally
Download the repository and open it with a local server (for example the "Live Server" extension in VS Code). Opening index.html directly may block image analysis in some browsers.

## License
MIT License (see LICENSE).
