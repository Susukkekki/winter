package io.wintershop.cartapi.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cart")
public class CartController {
    @GetMapping
    @PreAuthorize("hasRole('user')")
    public String getCartList() {
        return "here are cart list";
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public String getCart(@PathVariable Integer id) {
        return String.format("here is a detailed cart of %d", id);
    }
}
