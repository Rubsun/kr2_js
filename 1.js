const fs = require('fs')

class Task {
    constructor(id, duration, dependencies = [], priority = 1) {
        this.id = id
        this.duration = duration
        this.dependencies = dependencies
        this.priority = priority
        this.status = 'pending'
        this.checked = false
    }

    async execute(logToFile) {
        return new Promise((resolve) => {
            logToFile(`Task ${this.id} началась, длительность: ${this.duration} сек`)
            setTimeout(() => {
                this.status = 'done'
                logToFile(`Task ${this.id} выполнено`)
                resolve()
            }, this.duration * 1000)
        })
    }
}

class Robot {
    constructor(id) {
        this.id = id
        this.currentTask = null
        this.idleTime = 0
    }

    async performTask(task, logToFile) {
        this.currentTask = task
        task.status = 'in-progress'
        logToFile(`Робот ${this.id} взял Task ${task.id}`)
        await task.execute(logToFile)
        this.currentTask = null
    }

}



class Scheduler {
    constructor(robots, tasks, logFilePath = 'factory_logs.txt') {
        this.robots = robots
        this.tasks = tasks
        this.taskQueue = []
        this.logFilePath = logFilePath

        fs.writeFileSync(this.logFilePath, 'Factory Logs\n\n', {
            flag: 'w'
        })
    }

    logToFile(message) {
        const timestamp = new Date().toISOString()
        const logMessage = `${timestamp} - ${message}\n`
        fs.appendFileSync(this.logFilePath, logMessage)
    }

    canExecute(task) {
        return task.dependencies.every(dep => dep.status === 'done')
    }

    checkCircularDependencies(task, visited = new Set()) {
        if (visited.has(task)) {
            this.logToFile(`Warning: Task ${task.id} не может быть выполнена!`)
            task.status = 'unexecutable'
            return true
        }

        visited.add(task)

        for (let dep of task.dependencies) {
            if (this.checkCircularDependencies(dep, visited)) {
                return true
            }
        }

        visited.delete(task)
        return false
    }

    async schedule() {
        this.tasks.forEach(task => {
            if (!task.checked) {
                this.checkCircularDependencies(task)
                task.checked = true
            }
        })

        while (this.tasks.some(task => task.status !== 'done' && task.status !== 'unexecutable')) {
            this.tasks.forEach(task => {
                if (task.status === 'pending' && this.canExecute(task) && !this.taskQueue.includes(task)) {
                    this.taskQueue.push(task)
                }
            })
        
            this.taskQueue.sort((a, b) => b.priority - a.priority)
        
            console.log("Очередь Задач:", this.taskQueue.map(task => task.id))
        
            for (let robot of this.robots) {
                if (robot.currentTask === null && this.taskQueue.length > 0) {
                    const task = this.taskQueue.shift()
                    robot.performTask(task, this.logToFile.bind(this))
                } else if (robot.currentTask === null) {
                    robot.idleTime += 1
                }
            }
        
            await new Promise(res => setTimeout(res, 1000))
        }
        

        this.logToFile("Все задачи выполнены")
        this.logIdleTimes()
    }

    logIdleTimes() {
        this.logToFile("\nОтчет:")
        this.robots.forEach(robot => {
            this.logToFile(`Робот ${robot.id} отдыхал: ${robot.idleTime} секунд`)
        })
    }
}


const taskA = new Task('A', 3)
const taskB = new Task('B', 2, [taskA], priority=1)
const taskC = new Task('C', 5, [taskA], priority=2)
const taskD = new Task('D', 1, [taskB, taskC])
const taskE = new Task('E', 2, [taskD])

const taskF = new Task('F', 4, [taskE]) // Создание зависимости F -> E
taskE.dependencies.push(taskF) // Создание зависимости E -> F

const tasks = [taskA, taskB, taskC, taskD, taskE, taskF]

const robots = [new Robot(1)]
// const robots = [new Robot(1), new Robot(2), new Robot(3)]

const scheduler = new Scheduler(robots, tasks)

scheduler.schedule()