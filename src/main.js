import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

const app = document.querySelector('#app');

app.innerHTML = `
  <div class="container mt-5">
    <h1 class="text-center mb-4">RSS Aggregator</h1>
    <div class="row justify-content-center">
      <div class="col-md-8">
        <form id="rss-form" class="mb-3">
          <div class="input-group">
            <input 
              type="url" 
              class="form-control" 
              placeholder="Enter RSS URL" 
              aria-label="RSS URL"
              required
            >
            <button class="btn btn-primary" type="submit">Add</button>
          </div>
        </form>
        <div id="feeds" class="list-group"></div>
      </div>
    </div>
  </div>
`;

const form = document.getElementById('rss-form');
const feeds = document.getElementById('feeds');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const input = form.querySelector('input');
  const url = input.value;
  
  if (!url) return;
  
  const feedItem = document.createElement('a');
  feedItem.href = '#';
  feedItem.className = 'list-group-item list-group-item-action';
  feedItem.innerHTML = `
    <strong>${url}</strong>
    <small class="text-muted float-end">just now</small>
  `;
  
  feeds.prepend(feedItem);
  input.value = '';
});