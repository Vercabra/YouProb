# Аналіз предметної області:
### Цей файл має мету дати користувачеві розуміння принципів роботи YouTube
## Основні визначення:
  * _Відеохостінг_:  сайт, що дозволяє завантажувати та переглядати відео у браузері, наприклад через спеціальний програвач. При цьому більшість подібних сервісів не надають відео, слідуючи таким чином принципом User-generated content. 
  Відеохостинг став набирати популярність разом з розповсюдженням широкосмугового доступу в Інтернет і розвитком (здешевленням) жорстких дисків. Сервіс YouTube, що належить сьогодні компанії Google, зробив революцію — новим захопленням активних користувачів Інтернету став перегляд відеосюжетів онлайн.
  * _YouTube_: популярний відеохостинг, що надає послуги розміщення відеоматеріалів. Заснований 14 лютого 2005 року трьома працівниками PayPal: Чадом Герлі, Стівеном Чені та Джаведом Карімом. Є підрозділом компанії Google. Станом на серпень 2019 року YouTube є другим за відвідуваністю сайтом в Інтернеті (за даними компанії Alexa Internet). Користувачі можуть додавати, переглядати і коментувати ті чи інші відеозаписи. Завдяки простоті та зручності використання, YouTube став одним із найпопулярніших місць для розміщення відеофайлів. Служба містить як професійні, так і аматорські відеозаписи, у тому числі відеоблоги.
  * _Відеоролик_: Завантажений на платформу YouTube файл у будь-якому відеоформаті, котрий підтримує система.
  * _Пошукова Система_: в контексті цього проекту буде матися наувазі система пошуку YouTube, котра являє собою строку, куди можна ввести сформований запит у вигляді слова, речення, символу, тощо. Як результат - система видає список відеороліків у предперегляді, котрі відповідають запиту.
  * _YouTube-канал (далі - канал)_: Користувацький акаунт(обліковий запис користувача у системі) і одночас сторінка акаунту де є змога переглянути відеороліки користувача(автора відео)
    (Звичайна структура канала):
    ![image](https://user-images.githubusercontent.com/60894423/118081088-5ae6c580-b3c3-11eb-9a86-0d2e2e26094c.png)
## Функіональність каналу:
##### (Слід зазначити, що переглядати відео можна і без створення акаунту, але тоді не буде доступу к функціям, котрі будуть описані нижче)
 * _Плейлист_: (англ. Play - грати List - список) Список з відео для програвання. Список може бути сформованим користувачем (з будь-яких відео) або системою. Зазвичай, автори каналів власноруч роблять тематичні плейлисти зі своїх відео. На каналі (див. попердній скриншот) є змога переглянути такі плелисти.
 * _Коментарі_: секція під плеєром, де користувачі можуть залишити будь-який текст, який рахуватиметься як один коментар. Їх кількість рахується.
 * _Лайк\Дизлайк_: вид користувацької реакції (подобається\не подобається), представлений у вигляді двох кнопок під плеєром. Їх кількість рахується.
 * _Перегляди_: кількість переглядів відео.
 * _Підписки_: кількість підписників каналу.
 * _Опис відео_: Секція під плеєром, де міститься короткий опис відео, посилання, тощо.
 
## Опис API
Загалом нас будуть цікавити 2 Promise:
```javascript
search.list
```
В нього є наступні параметри:
* ```q ``` - саме пошуковий запит.
* ```part ``` - частина пушукових результатів (нас цікавить ```snippet```, тому що саме там храняться ```videoId```
* ```maxResults``` - кількість перших запитів.
*  ```key``` - наш виданий YouTube токен.
І резульат який нас цікавить - ```videoId```, котрий ми як параметр передаємо в наступний Promise
```javascript
video.list
```
Має ідентичні вхідні парметром, за винятком ```q ```, замість нього тепер ```videoId```. Результатом отримаємо ```.snippet.title``` та ```.data.items[0].statistics.viewCount```, котрі передамо в JSON файл (з нього ж і беромо вхідні данні).
## Опис Коду
![1111](https://user-images.githubusercontent.com/60894423/119036330-4d2fd200-b9b9-11eb-8e88-642670c385b3.png)
1. Підключення бібліотек: 
```javascript
require('dotenv').config()
Promise = require('bluebird')
const{ google } = require('googleapis')
const config =  require('./s_request.json')
let Queue = require("queue-promise")
const fs = require("fs")
const chalk = require("chalk")
const cliProgress = require('cli-progress')
const _ = require("lodash")
const moment = require("moment")
```
2. Створення черги та data1

```javascript
require('dotenv').config()
Promise = require('bluebird')
const{ google } = require('googleapis')
const config =  require('./s_request.json')
let Queue = require("queue-promise")
const fs = require("fs")
const chalk = require("chalk")
const cliProgress = require('cli-progress')
const _ = require("lodash")
const moment = require("moment") let data1 = []

    const queue = new Queue({
        concurrent: 10,
        interval: 2
    });
```
3. Progress bar

```javascript
const progressBar = new cliProgress.SingleBar({
        format: ' {bar} {percentage}% | {value}/{total} | elapsed: {duration_formatted} | estimated: {eta_formatted} ' +
            'Current Request: '+chalk.green('{req}'),
        hideCursor: true
    })

    progressBar.start(config.length,0)

    queue.on("resolve", res => {
        progressBar.update(data1.length,{req: source.req})
    })
```
4. Збір даних методами API

```javascript
config.forEach(source =>{
        queue.enqueue(() => new Promise((resolve, reject) => {
            google.youtube('v3').search.list({
                key: process.env.YOUTUBE_TOKEN,
                part: 'snippet',
                q: source.req,
                type: 'video',
                maxResults: source.amount,
            }).then((response) => {
                const {data} = response
                let result = []
                Promise.each(data.items, (item) => {
                    return google.youtube('v3').videos.list({
                        part: 'snippet,contentDetails,statistics',
                        id: item.id.videoId,
                        key: process.env.YOUTUBE_TOKEN,
                    }).then((response2 => {
                        let res = {title: item.snippet.title, views: response2.data.items[0].statistics.viewCount}
                        result.push(res)
                    })).catch((err) => console.log(err))
                }).then(() => {
                    source.result = result;
                    source.updatedAt = new Date();
                    resolve(source)
                    progressBar.update(data1.length, {req: source.req});
                })
            }).catch((err) => reject(err))
        }))
        })
    queue.start()
}
```
5. Запис результатів у JSON

```javascript
queue.on('end', () => {
        progressBar.stop()
        fs.writeFileSync(
            require.resolve("./s_request.json"),
            JSON.stringify(data1, null, " ")
        )
    })
 ```

