# Qblinks Quantum Cloud XIM Driver for Light/HUE

## Prepare

1. Run 'npm install'.
1. Add auth_url=https://authdev.qblinks.com/api into shell environment variables.
1. Add xim_url=https://ximdev.qblinks.com/api into shell environment variables.
1. Add ./bin into shell PATH variable.
1. Using Qblinks Clound account and password to login and get valid Quantum Token.
1. Get OAuth URL and proceed OAuth processes on Browser.
1. Apply authenticate method.

## Test Locally

1. Modify MY_QUANTUM_TOKEN in .xim_config file as a valid Quantum Token.
1. Create test data in event-samples folder.
1. Run quantum-local script to test driver and method locally.

```
quantum-local -l index.js -h handler -e event-samples/discovery.js -t 15
```
