const input = document.getElementById("input");
let inputFile;

const black = {rgb: [0, 0, 0], name: "black"}, 
white = {rgb: [255, 255, 255], name: "white"}, 
red = {rgb: [255, 0, 0], name: "red"}, 
green = {rgb: [0, 255, 0], name: "green"}, 
blue = {rgb: [0, 0, 255], name: "blue"},
yellow = {rgb: [255, 255, 0], name: "yellow"},
orange = {rgb: [255, 165, 0], name: "orange"},
purple = {rgb: [128, 0, 128], name: "purple"},
cyan = {rgb: [0, 255, 255], name: "cyan"};
const colors = [black, white, red, green, blue, yellow, orange, purple, cyan];

// does this just do it whenever the input changes?
// i don't think it would be toooo hard to add a button in case you add the wrong file
// just from my knowledge of js but idk it's not a big deal
//
// i vote if we can we break this into a seperate file/class just for handling the conversion from memory to an array
// considering the amount of geometry code there will be other than just this
input.onchange = () => {
    inputFile = input.files[0];
    inputFile.arrayBuffer()
        .then((buffer) => {
            let length = buffer.byteLength;
            let bhead = buffer.slice(0, 0x36);
            let bpp = new Uint16Array(bhead.slice(0x1C, 0x1E));
            let width = new Uint32Array(bhead.slice(0x12, 0x16));
            let height = new Uint32Array(bhead.slice(0x16, 0x1A));
            // maybe you could come up with a way to upscale cleanly so we could input a lower resolution
            // a factor that you increase memory by (maybe a constant that you multiply by some scaling factor)
            if (width != 480 || height != 240){
                throw new Error("incompatible dimensions (needs 480x240)")
            }
            //this assumes there isn't a color table
            let bimg = buffer.slice(0x36);
            const img = new Uint8Array(bimg);
            let pixels = [];
            for (let i = 0x36; i < length;){
                //windows stores rgb as bgr because they're high
                // couldn't you just iterate it once every iteration and just use (i+2, i+3)...?
                // i might be tripping
                let b = (new Uint8Array(buffer.slice(i, i+1))).at(0);
                i++;
                let g = (new Uint8Array(buffer.slice(i, i+1))).at(0);
                i++;
                let r = (new Uint8Array(buffer.slice(i, i+1))).at(0);
                i++;
                let pixel = [r, g, b];
                pixels.push(pixel);
            }
            let colorMap = [];
            for (let pixel of pixels){
                let lowest = Infinity; // Infinity = rare js W
                let pixelColor;
                for (let color of colors){
                    rDiff = Math.abs(pixel[0] - color.rgb[0]);
                    gDiff = Math.abs(pixel[1] - color.rgb[1]);
                    bDiff = Math.abs(pixel[2] - color.rgb[2]);
                    // this could be a weird way to calculate it
                    // there are other ways out there if you feel it looks tooooo terrible
                    totalDiff = rDiff + gDiff + bDiff;
                    if (totalDiff < lowest){
                        lowest = totalDiff;
                        pixelColor = color.name;
                    }
                }
                colorMap.push(pixelColor);
            }
            console.log(bpp, height, width);
            console.log(colorMap);
            let x = 0, y = 239;
            let output = [];
            for (let pixel of colorMap){
                output.push(`Brain.Screen.setPenColor(${pixel});`);
                output.push(`Brain.Screen.drawPixel(${x}, ${y});`)
                if (x == 479){
                    x = 0;
                    y--;
                } else {
                    x++;
                }
            }
            console.log(output);
        })
}



