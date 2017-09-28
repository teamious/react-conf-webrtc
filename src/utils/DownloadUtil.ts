export class DownloadUtil {
    public static download(url: string, filename?: string) {
        // Construct the a element
        var link = document.createElement("a");
        link.target = "_blank";

        // Construct the uri
        link.href = url;
        if (filename) {
            link.download = filename;
        }

        document.body.appendChild(link);
        link.click();

        // Cleanup the DOM
        document.body.removeChild(link);
    }
}
