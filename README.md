# Роботы и Задачи

## Запуск скрипта
### В самом скрипте уже есть пример запуска. Нужно создать роботов, задачи и планировщик задач.

Пример:
```javascript
const taskA = new Task('A', 3)
const taskB = new Task('B', 2, [taskA], 1)
const taskC = new Task('C', 5, [taskA], 2)
const taskD = new Task('D', 1, [taskB, taskC])
const taskE = new Task('E', 2, [taskD])

const tasks = [taskA, taskB, taskC, taskD, taskE]
const robots = [new Robot(1), new Robot(2)]

const scheduler = new Scheduler(robots, tasks)
scheduler.schedule()
```
## Логирование
### Логи записываются в отдельный файл *factory_logs.txt*. Очередь задач можно посмотреть в консоли.
### Каждое событие, связанное с выполнением задач и работой роботов, логируется с указанием временной метки.

