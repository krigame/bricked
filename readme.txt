Used pixi.js/canvas to deal with the animation part, rest of the UI is coded in regular html.


Comments about pixi.js
- probably could have tried to solve the task in some other ways, but as far as I know pixi is sort of an industry standard, when it comes to developing slot games.
- some corners have been cut and the code might not be the nicest as i have never worked with pixijs before 2 days ago.
- one might recognize some of the pixi-related code (as the base for the reels were copied from the pixijs examples' page), but that what I was using to sort of reverse-engineer how pixijs works


Some things I consider missing but have not included due to time limits
- the game area is not responsive: the game area has fixed width and that's it. 
working with responsive web is a part of my daily life, but it still takes a bit time to make the UI and canvas work nicely on different screen sizes. 
- no "disabled" behavior on buttons: spin button and bet +/- buttons do not have disabled state during cases when they don't do anything. 
- css is plain css, which i regret as I am used to work with scss, thus the css classes are not that uniformed and nice