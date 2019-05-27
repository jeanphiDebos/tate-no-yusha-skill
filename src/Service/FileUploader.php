<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\File\UploadedFile;

class FileUploader
{
    private $fileDirectory;
    private $pathFileDirectory;

    /**
     * FileUploader constructor.
     * @param string $fileDirectory
     * @param string $pathFileDirectory
     */
    public function __construct($fileDirectory, $pathFileDirectory)
    {
        $this->fileDirectory     = $fileDirectory;
        $this->pathFileDirectory = $pathFileDirectory;
    }

    public function upload(UploadedFile $file)
    {
        $filename = md5(uniqid()) . '.' . $file->guessExtension();
        $file->move($this->pathFileDirectory, $filename);
        return $this->fileDirectory. '/' . $filename;
    }

    public function uploadByPath(string $pathFile, $originalName = null)
    {
        $file = new UploadedFile($pathFile, $originalName ? $originalName : basename($pathFile));
        return $this->upload($file);
    }
}
