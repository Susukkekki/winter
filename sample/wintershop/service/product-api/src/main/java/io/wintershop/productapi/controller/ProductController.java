package io.wintershop.productapi.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/product")
public class ProductController {

    @GetMapping
    @PreAuthorize("hasRole('user')")
    public String getProductList() {
        return "here are product list";
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('admin')")
    public String getProduct(@PathVariable Integer id) {
        return String.format("here is a detailed product of %d", id);
    }
}
