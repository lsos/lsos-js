import { fgGreen } from "./colors";
import { EOL } from "os";

// Ascii art Source:
//  - http://patorjk.com/software/taag/#p=display&f=Ogre&t=Lsos
// Alternatives:
//  - http://patorjk.com/software/taag/#p=display&f=Big&t=Lsos
//  - http://patorjk.com/software/taag/#p=display&f=Standard&t=Lsos
//  - http://patorjk.com/software/taag/#p=display&f=Ivrit&t=Lsos

export const header = fgGreen(
  [
    String.raw`     __                 `,
    String.raw`    / / ___  ___  ___   `,
    String.raw`   / / / __|/ _ \/ __|  `,
    String.raw`  / /__\__ \ (_) \__ \  `,
    String.raw`  \____/___/\___/|___/  `,
    String.raw`                        `,
  ].join(EOL)
);
