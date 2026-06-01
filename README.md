# EquAlly

EquAlly is a web accessibility tool that I plan to develop as a personal project in my free time. I plan for it to provide basic features for your website to make it instantly more accessbile in a easy way.

***

## How to include this tool in your website?

Thats pretty easy! Simply add this script tag before the end of your ```<body>``` tag, thats it! This will automatically insert the accessibility menu to your page.

```
<script src=""></script>
```

### Custom configuration

You can change the following things about the tool by adding this right before the import.

```
<script>
  window.Equally = {}
</script>
<script src="equally-min.js"></script>
```

***

## Planned features for the tool

### Active features
(these can be activated/deactivated in the menu popup on the bottom of the screen)
- Dyslexic mode: Will change font and line height
- Color blind mode: Set your page to greyscale
- Hight contrast mode
- Seizure mode: removes flickering and animations
- Instant accessibility: Adding a black bar behind text and setting text color to white to make it easily readable
- Easily changing font size, line height and letter spacing

### Passive features

- Adding a skiplink menu that links to the navigation and main content of your page
- Tooltip for links, showing if they open in a new tab

***
