package com.example.demo;

import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin("*")

public class PostController {

    private final List<Post> posts = new ArrayList<>();

    @GetMapping
    public List<Post> getFeed() {
        return posts;
    }

    @PostMapping
    public Post createPost(@RequestBody Post post) {
        posts.add(post);
        return post;
    }
}

