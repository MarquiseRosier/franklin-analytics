Franklin Analytics
A Franklin site that houses data visualization tools that can be useful to site developers and authors!

## Environments
- Preview: https://main--franklin-analytics--marquiserosier.hlx.page/
- Live: https://main--franklin-analytics--marquiserosier.hlx.live/

## Installation

1. Install all of the dependencies you will need in order to develop!
  ```sh
  npm i
  ```
2. build runs partytown copylibs, and copys library files into the ./script folder. Also minifys them.
```sh 
 npm run build
``` 
  
3. 
## Linting

```sh
npm run lint
```

## Local development

1. Create a new repository based on the `helix-project-boilerplate` template and add a mountpoint in the `fstab.yaml`
1. Add the [helix-bot](https://github.com/apps/helix-bot) to the repository
1. Install the [Helix CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/helix-cli`
1. Start Franklin Proxy: `hlx up` (opens your browser at `http://localhost:3000`)
1. Open the `{repo}` directory in your favorite IDE and start coding :)
