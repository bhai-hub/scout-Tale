
export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-secondary/50">
      <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
        © {currentYear} Scout Tales. All rights reserved.
      </div>
    </footer>
  );
}
