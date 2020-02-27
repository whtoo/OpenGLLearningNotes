# WebGL中我所犯过的错误记录

## 1. RENDER WARNING: Render count or primcount is 0
这个问题通常是由于我们传给buffer的数据size不正确,比如0或者负数.
还有,如果我们传入的数组的size和我们指定给buffer的不匹配应该也会出这个问题.