package cache

import (
	"sync"
	"time"
)

type entry[V any] struct {
	value     V
	expiresAt time.Time
}

type Cache[K comparable, V any] struct {
	mu   sync.RWMutex
	data map[K]entry[V]
	ttl  time.Duration
}

func New[K comparable, V any](ttl time.Duration) *Cache[K, V] {
	return &Cache[K, V]{
		data: make(map[K]entry[V]),
		ttl:  ttl,
	}
}

func (c *Cache[K, V]) Get(key K) (V, bool) {
	c.mu.RLock()
	e, ok := c.data[key]
	c.mu.RUnlock()

	if !ok {
		var zero V
		return zero, false
	}
	if time.Now().After(e.expiresAt) {
		c.mu.Lock()
		if e2, still := c.data[key]; still && time.Now().After(e2.expiresAt) {
			delete(c.data, key)
		}
		c.mu.Unlock()
		var zero V
		return zero, false
	}
	return e.value, true
}

func (c *Cache[K, V]) Set(key K, value V) {
	c.mu.Lock()
	c.data[key] = entry[V]{value: value, expiresAt: time.Now().Add(c.ttl)}
	c.mu.Unlock()
}

func (c *Cache[K, V]) Delete(key K) {
	c.mu.Lock()
	delete(c.data, key)
	c.mu.Unlock()
}

func (c *Cache[K, V]) Flush() {
	c.mu.Lock()
	c.data = make(map[K]entry[V])
	c.mu.Unlock()
}
