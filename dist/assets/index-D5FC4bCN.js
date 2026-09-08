(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))s(t);new MutationObserver(t=>{for(const n of t)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function i(t){const n={};return t.integrity&&(n.integrity=t.integrity),t.referrerPolicy&&(n.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?n.credentials="include":t.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(t){if(t.ep)return;t.ep=!0;const n=i(t);fetch(t.href,n)}})();const V=Symbol(),A=Object.getPrototypeOf,D=new WeakMap,W=e=>e&&(D.has(e)?D.get(e):A(e)===Object.prototype||A(e)===Array.prototype),j=e=>W(e)&&e[V]||null,I={},k=e=>typeof e=="object"&&e!==null,z=e=>k(e)&&!O.has(e)&&(Array.isArray(e)||!(Symbol.iterator in e))&&!(e instanceof WeakMap)&&!(e instanceof WeakSet)&&!(e instanceof Error)&&!(e instanceof Number)&&!(e instanceof Date)&&!(e instanceof String)&&!(e instanceof RegExp)&&!(e instanceof ArrayBuffer)&&!(e instanceof Promise),F=(e,o,i,s)=>({deleteProperty(t,n){Reflect.get(t,n),i(n);const r=Reflect.deleteProperty(t,n);return r&&s(void 0),r},set(t,n,r,l){const d=!e()&&Reflect.has(t,n),p=Reflect.get(t,n,l);if(d&&(q(p,r)||T.has(r)&&q(p,T.get(r))))return!0;i(n),k(r)&&(r=j(r)||r);const m=!R.has(r)&&K(r)?N(r):r;return o(n,m),Reflect.set(t,n,m,l),s(void 0),!0}}),R=new WeakMap,O=new WeakSet,U=[1],T=new WeakMap;let q=Object.is,G=(e,o)=>new Proxy(e,o),K=z,Q=F;function N(e={}){if(!k(e))throw new Error("object required");const o=T.get(e);if(o)return o;let i=U[0];const s=new Set,t=(c,u=++U[0])=>{i!==u&&(n=i=u,s.forEach(f=>f(c,u)))};let n=i;const r=(c=U[0])=>(n!==c&&(n=c,d.forEach(([u])=>{const f=u[1](c);f>i&&(i=f)})),i),l=c=>(u,f)=>{let w;u&&(w=[...u],w[1]=[c,...w[1]]),t(w,f)},d=new Map,p=(c,u)=>{const f=!O.has(u)&&R.get(u);if(f){if((I?"production":void 0)!=="production"&&d.has(c))throw new Error("prop listener already exists");if(s.size){const w=f[2](l(c));d.set(c,[f,w])}else d.set(c,[f])}},m=c=>{var u;const f=d.get(c);f&&(d.delete(c),(u=f[1])==null||u.call(f))},S=c=>(s.add(c),s.size===1&&d.forEach(([f,w],P)=>{if((I?"production":void 0)!=="production"&&w)throw new Error("remove already exists");const C=f[2](l(P));d.set(P,[f,C])}),()=>{s.delete(c),s.size===0&&d.forEach(([f,w],P)=>{w&&(w(),d.set(P,[f]))})});let b=!0;const L=Q(()=>b,p,m,t),a=G(e,L);T.set(e,a);const h=[e,r,S];return R.set(a,h),Reflect.ownKeys(e).forEach(c=>{const u=Object.getOwnPropertyDescriptor(e,c);"value"in u&&u.writable&&(a[c]=e[c])}),b=!1,a}function Y(e,o,i){const s=R.get(e);(I?"production":void 0)!=="production"&&!s&&console.warn("Please use proxy object");let t;const n=[],r=s[2];let l=!1;const p=r(m=>{m&&n.push(m),t||(t=Promise.resolve().then(()=>{t=void 0,l&&o(n.splice(0))}))});return l=!0,()=>{l=!1,p()}}const y=N({feeds:[],posts:[],form:{loading:!1,error:"",status:""}}),J=e=>{try{const o=new URL(e);return["http:","https:"].includes(o.protocol)}catch{return!1}},X=async(e,o=[])=>{if(!e||!J(e)){const i=new Error("validation.url");throw i.name="ValidationError",i}if(o.includes(e)){const i=new Error("validation.duplicate");throw i.name="ValidationError",i}return!0},Z=1e4,ee=e=>{try{const o=new URL(e);return["http:","https:"].includes(o.protocol)}catch{return!1}},H=async e=>{if(!ee(e))throw new Error("Ссылка должна быть валидным URL");const o=`/rss-proxy?url=${encodeURIComponent(e)}`,i=new AbortController,s=setTimeout(()=>{i.abort()},Z);try{const t=await fetch(o,{signal:i.signal});if(!t.ok)throw new Error("Ошибка сети");const n=await t.text();if(!n.trim())throw new Error("Ресурс не содержит валидный RSS");return n}catch(t){throw t.name==="AbortError"?new Error("Ошибка сети"):t instanceof TypeError?new Error("Ошибка сети"):t}finally{clearTimeout(s)}},E=(e,o)=>e.querySelector(o)?.textContent?.trim()||"",v=(e,o)=>e.getElementsByTagName(o)[0]?.textContent?.trim()||"",M=e=>E(e,"description")||v(e,"content:encoded")||v(e,"summary")||v(e,"content"),te=e=>v(e,"author")||v(e,"dc:creator"),re=e=>[...e.getElementsByTagName("category")].map(o=>o.textContent?.trim()).filter(Boolean).join(", "),oe=({author:e,category:o,pubDate:i})=>{const s=[];return e&&s.push(`Автор: ${e}`),o&&s.push(`Категория: ${o}`),i&&s.push(`Дата публикации: ${i}`),s.length===0?"Описание поста отсутствует в RSS-фиде.":["Описание поста отсутствует в RSS-фиде.","",...s].join(`
`)},B=e=>{if(!e||typeof e!="string")throw new Error("RSS-ответ не является строкой");const o=new DOMParser().parseFromString(e,"application/xml");if([...o.getElementsByTagName("parsererror")].some(r=>r.textContent?.trim()))throw new Error("Ресурс не содержит валидный RSS");const s=o.querySelector("channel");if(!s)throw new Error("Ресурс не содержит валидный RSS");const t=E(s,"title");if(!t)throw new Error("Ресурс не содержит валидный RSS");const n=[...s.querySelectorAll("item")].map(r=>{const l=te(r),d=re(r),p=E(r,"pubDate"),m=M(r);return{title:E(r,"title"),description:m||oe({author:l,category:d,pubDate:p}),link:E(r,"link"),pubDate:p,author:l,category:d,seen:!1}}).filter(r=>r.title);return{feed:{title:t,description:M(s)||t},posts:n}},g=(e="")=>String(e).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;"),$=(e="")=>{try{const o=new URL(e,window.location.href);return["http:","https:"].includes(o.protocol)?o.href:"#"}catch{return"#"}},ne=e=>e.description||e.content||e.summary||"Описание отсутствует",se=e=>{const o=document.querySelector("#app");o.innerHTML=`
    <main id="app-content">
      <h1>RSS агрегатор</h1>

      <form id="rss-form">
        <label for="rss-url">
          Ссылка на RSS
        </label>

        <input
          id="rss-url"
          name="url"
          type="url"
          placeholder="Введите ссылку"
          autocomplete="off"
          required
        />

        <button
          id="submit-button"
          type="submit"
        >
          Добавить
        </button>
      </form>

      <p
        id="form-error"
        class="error"
        role="alert"
      ></p>

      <p
        id="status"
        class="status"
        role="status"
      ></p>

      <section id="feeds-section">
        <h2>Фиды</h2>
        <div id="feeds"></div>
      </section>

      <section id="posts-section">
        <h2>Посты</h2>
        <ul id="posts"></ul>
      </section>
    </main>
  `;const i=document.querySelector("#rss-form"),s=document.querySelector("#rss-url"),t=document.querySelector("#submit-button"),n=document.querySelector("#form-error"),r=document.querySelector("#status"),l=document.querySelector("#feeds"),d=document.querySelector("#posts"),p=()=>{const a=document.querySelector("#post-preview-modal");a&&(a.close(),a.remove())},m=a=>{a.seen=!0,p();const h=document.createElement("dialog");h.id="post-preview-modal",h.innerHTML=`
      <div data-test="modal-body">
        <h2>
          ${g(a.title)}
        </h2>

        <p>
          ${g(ne(a))}
        </p>

        <div class="modal-actions">
          <button
            class="close-modal"
            type="button"
          >
            Закрыть
          </button>

          <a
            class="full-link"
            href="${g($(a.link))}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Читать полностью
          </a>
        </div>
      </div>
    `,document.body.append(h),h.querySelector(".close-modal").addEventListener("click",p),h.addEventListener("click",u=>{u.target===h&&p()}),h.addEventListener("cancel",u=>{u.preventDefault(),p()}),h.showModal()},S=()=>{if(e.feeds.length===0){l.innerHTML="";return}l.innerHTML=e.feeds.map(a=>`
          <article class="feed">
            <h3>
              ${g(a.title)}
            </h3>

            <p>
              ${g(a.description||"")}
            </p>
          </article>
        `).join("")},b=()=>{if(e.posts.length===0){d.innerHTML="";return}d.innerHTML=e.posts.map((a,h)=>{const c=a.seen===!0;return`
          <li class="post">
            <div class="post-header">
              <a
                class="post-link"
                href="${g($(a.link))}"
                target="_blank"
                rel="noopener noreferrer"
                data-seen="${c}"
              >
                ${g(a.title)}
              </a>

              <button
                class="preview-button"
                type="button"
                data-preview-index="${h}"
              >
                Просмотр
              </button>
            </div>

            ${a.pubDate?`
                  <time class="post-date">
                    ${g(a.pubDate)}
                  </time>
                `:""}
          </li>
        `}).join(""),d.querySelectorAll("[data-preview-index]").forEach(a=>{a.addEventListener("click",()=>{const h=Number(a.dataset.previewIndex),c=e.posts[h];c&&m(c)})})},L=()=>{n.textContent=e.form.error||"",r.textContent=e.form.status||"",t.disabled=e.form.loading,S(),b()};return Y(e,L),L(),{form:i,input:s}},ie=5e3,x=e=>e.link||e.title,ce=(e,o,i=[])=>{const s=new Set(e.posts.filter(r=>r.feedId===o.id).map(x)),t=new Set,n=[];i.forEach(r=>{const l=x(r);!l||s.has(l)||t.has(l)||(t.add(l),n.push({id:crypto.randomUUID(),feedId:o.id,title:r.title||"Без заголовка",description:r.description||"",link:r.link||"",pubDate:r.pubDate||"",author:r.author||"",category:r.category||"",seen:!1}))}),n.length>0&&e.posts.unshift(...n)},ae=(e,o,i)=>{let s=!1,t=!1,n=null;const r=()=>{t||(n=setTimeout(l,ie))},l=async()=>{if(!(t||s)){s=!0;try{const d=[...e.feeds];await Promise.all(d.map(async p=>{try{const m=await o(p.url),S=i(m);ce(e,p,S?.posts||[])}catch(m){console.error(`Ошибка обновления фида "${p.title}":`,m)}}))}finally{s=!1,r()}}};return l(),()=>{t=!0,n!==null&&(clearTimeout(n),n=null)}},{form:le,input:_}=se(y);le.addEventListener("submit",async e=>{e.preventDefault();const o=_.value.trim();y.form.error="",y.form.status="",y.form.loading=!0;try{await X(o,y.feeds.map(r=>r.url));const i=await H(o),s=B(i);if(!s.feed||!s.feed.title)throw new Error("invalid-rss");const t={id:crypto.randomUUID(),url:o,title:s.feed.title,description:s.feed.description||""};y.feeds.push(t);const n=s.posts.map(r=>({...r,id:crypto.randomUUID(),feedId:t.id,seen:!1}));y.posts.unshift(...n),_.value="",y.form.status="RSS успешно загружен"}catch(i){if(console.error(i),i.name==="ValidationError"){i.message==="validation.duplicate"?y.form.error="RSS уже существует":y.form.error="Ссылка должна быть валидным URL";return}if(i.message==="invalid-rss"||i.message.includes("RSS")||i.message.includes("channel")){y.form.error="Ресурс не содержит валидный RSS";return}y.form.error="Ошибка сети"}finally{y.form.loading=!1}});ae(y,H,B);
